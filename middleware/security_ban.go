package middleware

import (
	"bytes"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
)

type RateTracker struct {
	Count     int
	Timestamp int64
}

var (
	bannedIPs   = make(map[string]time.Time)
	ipTrackers  = make(map[string]*RateTracker)
	userTrackers = make(map[int]*RateTracker)
	securityMu  sync.RWMutex
)

// IsIPBanned checks if an IP is currently banned
func IsIPBanned(ip string) bool {
	securityMu.RLock()
	defer securityMu.RUnlock()

	if expireAt, exists := bannedIPs[ip]; exists {
		if time.Now().Before(expireAt) {
			return true
		}
	}
	return false
}

// BanIP bans an IP for duration
func BanIP(ip string, duration time.Duration) {
	securityMu.Lock()
	defer securityMu.Unlock()
	bannedIPs[ip] = time.Now().Add(duration)
}

// UnbanIP unbans an IP
func UnbanIP(ip string) {
	securityMu.Lock()
	defer securityMu.Unlock()
	delete(bannedIPs, ip)
}

// GetBannedIPs returns active banned IPs
func GetBannedIPs() map[string]time.Time {
	securityMu.RLock()
	defer securityMu.RUnlock()

	active := make(map[string]time.Time)
	now := time.Now()
	for ip, exp := range bannedIPs {
		if now.Before(exp) {
			active[ip] = exp
		}
	}
	return active
}

// SecurityAutoBanMiddleware monitors request rate per second and auto-bans offending IPs and Users
func SecurityAutoBanMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !setting.SecurityAutoBanEnabled {
			c.Next()
			return
		}

		clientIP := c.ClientIP()

		// 1. Check if IP is already banned
		if IsIPBanned(clientIP) {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "ip_banned",
				"message": "Địa chỉ IP của bạn đã bị tạm khóa do gửi quá nhiều yêu cầu bất thường (Spam/DDoS).",
			})
			c.Abort()
			return
		}

		nowUnix := time.Now().Unix()

		// 2. Track IP Rate (req/s)
		securityMu.Lock()
		tracker, exists := ipTrackers[clientIP]
		if !exists || tracker.Timestamp != nowUnix {
			tracker = &RateTracker{Count: 1, Timestamp: nowUnix}
			ipTrackers[clientIP] = tracker
		} else {
			tracker.Count++
		}
		ipRPS := tracker.Count
		securityMu.Unlock()

		maxIPRPS := setting.SecurityIPMaxRPS
		if maxIPRPS <= 0 {
			maxIPRPS = 15
		}

		if ipRPS > maxIPRPS {
			banDuration := time.Duration(setting.SecurityBanDurationMinutes) * time.Minute
			if banDuration <= 0 {
				banDuration = 60 * time.Minute
			}
			BanIP(clientIP, banDuration)

			logger.LogWarn(c.Request.Context(), fmt.Sprintf("[SECURITY-AUTO-BAN] Auto-banned IP %s (sent %d req/s, threshold %d req/s)", clientIP, ipRPS, maxIPRPS))
			go sendTelegramSecurityAlert(fmt.Sprintf(
				"🚨 <b>[BẢO MẬT] ĐÃ TỰ ĐỘNG KHÓA IP</b>\n\n"+
					"🌐 <b>IP:</b> <code>%s</code>\n"+
					"⚡ <b>Hành vi:</b> Gửi quá tải <b>%d req/s</b> (Ngưỡng: %d req/s)\n"+
					"⏳ <b>Thời gian khóa:</b> %d phút\n"+
					"🔗 <b>Endpoint:</b> <code>%s %s</code>",
				clientIP,
				ipRPS,
				maxIPRPS,
				int(banDuration.Minutes()),
				c.Request.Method,
				c.Request.URL.Path,
			))

			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error":   "ip_banned",
				"message": "Bạn đã gửi quá nhiều yêu cầu trong 1 giây. IP của bạn đã bị khóa tạm thời.",
			})
			c.Abort()
			return
		}

		// 3. Track Authenticated User Rate (req/s)
		userID := c.GetInt("id")
		if userID > 0 {
			securityMu.Lock()
			uTracker, uExists := userTrackers[userID]
			if !uExists || uTracker.Timestamp != nowUnix {
				uTracker = &RateTracker{Count: 1, Timestamp: nowUnix}
				userTrackers[userID] = uTracker
			} else {
				uTracker.Count++
			}
			userRPS := uTracker.Count
			securityMu.Unlock()

			maxUserRPS := setting.SecurityUserMaxRPS
			if maxUserRPS <= 0 {
				maxUserRPS = 10
			}

			if userRPS > maxUserRPS {
				// Auto-disable user account in DB
				_ = model.DB.Model(&model.User{}).Where("id = ?", userID).Update("status", common.UserStatusDisabled)

				logger.LogWarn(c.Request.Context(), fmt.Sprintf("[SECURITY-AUTO-BAN] Auto-disabled User ID %d (sent %d req/s, threshold %d req/s)", userID, userRPS, maxUserRPS))
				go sendTelegramSecurityAlert(fmt.Sprintf(
					"🚨 <b>[BẢO MẬT] ĐÃ TỰ ĐỘNG KHÓA TÀI KHOẢN USER</b>\n\n"+
						"👤 <b>User ID:</b> <code>#%d</code>\n"+
						"🌐 <b>IP:</b> <code>%s</code>\n"+
						"⚡ <b>Hành vi:</b> Spam <b>%d req/s</b> (Ngưỡng: %d req/s)\n"+
						"❌ <b>Trạng thái:</b> Tài khoản đã bị vô hiệu hóa (Disabled)!\n"+
						"🔗 <b>Endpoint:</b> <code>%s %s</code>",
					userID,
					clientIP,
					userRPS,
					maxUserRPS,
					c.Request.Method,
					c.Request.URL.Path,
				))

				c.JSON(http.StatusForbidden, gin.H{
					"success": false,
					"error":   "user_disabled",
					"message": "Tài khoản của bạn đã bị vô hiệu hóa do vi phạm chính sách gửi yêu cầu quá mức quy định.",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

func sendTelegramSecurityAlert(text string) {
	token := setting.TelegramBotToken
	adminID := setting.TelegramAdminId
	if token == "" || adminID == 0 {
		return
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	body, _ := common.Marshal(map[string]interface{}{
		"chat_id":    adminID,
		"text":       text,
		"parse_mode": "HTML",
	})
	http.Post(url, "application/json", bytes.NewReader(body))
}

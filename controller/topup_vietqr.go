package controller

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"math"
	"net/http"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"github.com/thanhpk/randstr"
)

type VietQRRateCache struct {
	Rate      float64
	UpdatedAt time.Time
	mu        sync.RWMutex
}

type GeoIPCache struct {
	cache map[string]string
	mu    sync.RWMutex
}

var (
	vietqrRateCache = VietQRRateCache{
		Rate: 25800.0,
	}
	geoIPCache = GeoIPCache{
		cache: make(map[string]string),
	}
	telegramPollerStarted = false
	telegramPollerMu      sync.Mutex
)

// IsVietnamIP checks if the request originates from Vietnam
func IsVietnamIP(c *gin.Context) bool {
	// 1. Cloudflare Country Header
	cfCountry := strings.ToUpper(strings.TrimSpace(c.GetHeader("CF-IPCountry")))
	if cfCountry != "" {
		return cfCountry == "VN"
	}

	// 2. Custom header
	xCountry := strings.ToUpper(strings.TrimSpace(c.GetHeader("X-Country-Code")))
	if xCountry != "" {
		return xCountry == "VN"
	}

	clientIP := c.ClientIP()
	if clientIP == "" || clientIP == "127.0.0.1" || clientIP == "::1" ||
		strings.HasPrefix(clientIP, "192.168.") || strings.HasPrefix(clientIP, "10.") ||
		strings.HasPrefix(clientIP, "172.16.") || strings.HasPrefix(clientIP, "172.17.") ||
		strings.HasPrefix(clientIP, "172.18.") || strings.HasPrefix(clientIP, "172.19.") ||
		strings.HasPrefix(clientIP, "172.2") || strings.HasPrefix(clientIP, "172.3") {
		return true // Allow localhost and local private networks
	}

	geoIPCache.mu.RLock()
	if code, found := geoIPCache.cache[clientIP]; found {
		geoIPCache.mu.RUnlock()
		return code == "VN"
	}
	geoIPCache.mu.RUnlock()

	code := fetchIPCountryCode(clientIP)
	geoIPCache.mu.Lock()
	geoIPCache.cache[clientIP] = code
	geoIPCache.mu.Unlock()

	return code == "VN"
}

func fetchIPCountryCode(ip string) string {
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(fmt.Sprintf("http://ip-api.com/json/%s?fields=countryCode", ip))
	if err != nil {
		return "VN" // Fallback to VN if external lookup fails
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "VN"
	}

	var res struct {
		CountryCode string `json:"countryCode"`
	}
	if err := common.Unmarshal(body, &res); err == nil && res.CountryCode != "" {
		return strings.ToUpper(res.CountryCode)
	}
	return "VN"
}

// FetchLiveUSDTVNDRate fetches live USDT/VND rate from Binance P2P, with CoinGecko fallback
func FetchLiveUSDTVNDRate() float64 {
	cacheTTL := time.Duration(setting.VietQRRateCacheMinutes) * time.Minute
	if cacheTTL > 0 {
		vietqrRateCache.mu.RLock()
		if time.Since(vietqrRateCache.UpdatedAt) < cacheTTL && vietqrRateCache.Rate > 20000 {
			cachedRate := vietqrRateCache.Rate
			vietqrRateCache.mu.RUnlock()
			return cachedRate
		}
		vietqrRateCache.mu.RUnlock()
	}

	// 1. Primary: Binance P2P API
	rate, err := fetchBinanceP2PRate()
	if err == nil && rate > 20000 {
		vietqrRateCache.mu.Lock()
		vietqrRateCache.Rate = rate
		vietqrRateCache.UpdatedAt = time.Now()
		vietqrRateCache.mu.Unlock()
		return rate
	}
	if err != nil {
		common.SysLog("[VietQR] Binance P2P fetch failed: " + err.Error() + ", trying CoinGecko...")
	}

	// 2. Fallback: CoinGecko API
	cgRate, cgErr := fetchCoinGeckoRate()
	if cgErr == nil && cgRate > 20000 {
		vietqrRateCache.mu.Lock()
		vietqrRateCache.Rate = cgRate
		vietqrRateCache.UpdatedAt = time.Now()
		vietqrRateCache.mu.Unlock()
		return cgRate
	}
	if cgErr != nil {
		common.SysLog("[VietQR] CoinGecko fetch failed: " + cgErr.Error())
	}

	vietqrRateCache.mu.RLock()
	fallback := vietqrRateCache.Rate
	vietqrRateCache.mu.RUnlock()
	if fallback < 20000 {
		fallback = setting.VietQRDefaultRate
		if fallback < 20000 {
			fallback = 25800.0
		}
	}
	return fallback
}

func fetchBinanceP2PRate() (float64, error) {
	apiUrl := setting.VietQRBinanceP2PUrl
	if apiUrl == "" {
		apiUrl = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
	}
	client := &http.Client{Timeout: 8 * time.Second}
	reqBody := `{"asset":"USDT","fiat":"VND","merchantCheck":false,"page":1,"rows":3,"tradeType":"BUY"}`
	req, err := http.NewRequest("POST", apiUrl, strings.NewReader(reqBody))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var res struct {
		Code string `json:"code"`
		Data []struct {
			Adv struct {
				Price string `json:"price"`
			} `json:"adv"`
		} `json:"data"`
	}
	if err := common.Unmarshal(body, &res); err != nil {
		return 0, err
	}

	if len(res.Data) > 0 && res.Data[0].Adv.Price != "" {
		price, err := strconv.ParseFloat(res.Data[0].Adv.Price, 64)
		if err == nil && price > 20000 {
			return price, nil
		}
	}
	return 0, fmt.Errorf("invalid binance response")
}

func fetchCoinGeckoRate() (float64, error) {
	apiUrl := setting.VietQRCoinGeckoUrl
	if apiUrl == "" {
		apiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,vnd"
	}
	client := &http.Client{Timeout: 8 * time.Second}
	req, err := http.NewRequest("GET", apiUrl, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("User-Agent", "Keichan-Gateway")

	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, err
	}

	var res struct {
		Tether struct {
			Vnd float64 `json:"vnd"`
		} `json:"tether"`
	}
	if err := common.Unmarshal(body, &res); err != nil {
		return 0, err
	}

	if res.Tether.Vnd > 20000 {
		return res.Tether.Vnd, nil
	}
	return 0, fmt.Errorf("invalid coingecko response")
}

// CalculateVietQRMoney returns final VND amount with infra fee (+2%)
func CalculateVietQRMoney(amountUSD float64) (vndAmount int64, unitRate float64) {
	rawRate := FetchLiveUSDTVNDRate()
	// Apply +2% infrastructure fee
	effectiveRate := rawRate * (1.0 + setting.VietQRInfraFeeRatio)
	totalVND := amountUSD * effectiveRate
	// Round to integer VND
	roundedVND := int64(math.Round(totalVND))
	return roundedVND, effectiveRate
}

type VietQRAmountRequest struct {
	Amount int64 `json:"amount"` // USD Quota amount
}

func RequestVietQRAmount(c *gin.Context) {
	if !IsVietnamIP(c) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Phương thức VietQR chỉ khả dụng cho người dùng tại Việt Nam.",
		})
		return
	}

	var req VietQRAmountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Tham số không hợp lệ"})
		return
	}

	if req.Amount < int64(setting.VietQRMinTopUp) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("Số tiền nạp tối thiểu là $%d", setting.VietQRMinTopUp),
		})
		return
	}

	amountUSD := float64(req.Amount)
	vndAmount, rate := CalculateVietQRMoney(amountUSD)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"usd":        amountUSD,
			"vnd":        vndAmount,
			"rate":       math.Round(rate),
			"fee_ratio":  setting.VietQRInfraFeeRatio,
			"bank_id":    setting.VietQRBankId,
			"account_no": setting.VietQRAccountNo,
		},
	})
}

type VietQRTopUpRequest struct {
	Amount int64 `json:"amount"` // USD Quota amount
}

func RequestVietQRTopUp(c *gin.Context) {
	if !IsVietnamIP(c) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Phương thức VietQR chỉ khả dụng cho người dùng tại Việt Nam.",
		})
		return
	}

	var req VietQRTopUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Tham số không hợp lệ"})
		return
	}

	if req.Amount < int64(setting.VietQRMinTopUp) {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": fmt.Sprintf("Số tiền nạp tối thiểu là $%d", setting.VietQRMinTopUp),
		})
		return
	}

	userId := c.GetInt("id")
	user, err := model.GetUserById(userId, true)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Không tìm thấy người dùng"})
		return
	}

	creditedQuota, err := common.QuotaFromDecimalStrict(
		decimal.NewFromInt(req.Amount).Mul(decimal.NewFromFloat(common.QuotaPerUnit)),
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Hạn mức nạp không hợp lệ"})
		return
	}

	if err := model.ValidateTopUpQuotaCapacity(userId, creditedQuota); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Số dư ví đã vượt quá hạn mức tối đa"})
		return
	}

	amountUSD := float64(req.Amount)
	vndAmount, rate := CalculateVietQRMoney(amountUSD)

	// Generate clean order code: KC + 6 random alphanumeric characters
	tradeNo := fmt.Sprintf("KC%s", strings.ToUpper(randstr.String(6)))

	topUp := &model.TopUp{
		UserId:          userId,
		Amount:          req.Amount,
		Money:           float64(vndAmount),
		TradeNo:         tradeNo,
		PaymentMethod:   model.PaymentMethodVietQR,
		PaymentProvider: model.PaymentProviderVietQR,
		CreateTime:      common.GetTimestamp(),
		Status:          common.TopUpStatusPending,
	}

	if err := topUp.Insert(); err != nil {
		common.SysError("failed to create VietQR topup record: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Không thể tạo đơn nạp"})
		return
	}

	// Generate VietQR Image URL
	// Template compact2 renders clean QR with bank header & amount
	qrUrl := fmt.Sprintf("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s",
		setting.VietQRBankId,
		setting.VietQRAccountNo,
		vndAmount,
		tradeNo,
	)

	// Send Telegram notification with Approve / Reject inline buttons to admin
	go sendTelegramOrderNotification(topUp, user.Username, amountUSD, vndAmount, qrUrl)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"trade_no":   tradeNo,
			"amount_usd": amountUSD,
			"amount_vnd": vndAmount,
			"rate":       math.Round(rate),
			"bank_id":    setting.VietQRBankId,
			"bank_name":  "MBBank (Ngân hàng Quân Đội)",
			"account_no": setting.VietQRAccountNo,
			"memo":       tradeNo,
			"qr_url":     qrUrl,
			"created_at": topUp.CreateTime,
			"expires_in": 1800, // 30 minutes
		},
	})
}

func CheckVietQRStatus(c *gin.Context) {
	tradeNo := c.Query("trade_no")
	if tradeNo == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Thiếu mã đơn hàng"})
		return
	}

	topUp := model.GetTopUpByTradeNo(tradeNo)
	if topUp == nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Đơn nạp không tồn tại"})
		return
	}

	userId := c.GetInt("id")
	if topUp.UserId != userId && c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "message": "Không có quyền truy cập"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"trade_no":      topUp.TradeNo,
			"status":        topUp.Status,
			"amount":        topUp.Amount,
			"money":         topUp.Money,
			"complete_time": topUp.CompleteTime,
		},
	})
}

// sendTelegramOrderNotification sends message to Admin Telegram
func sendTelegramOrderNotification(topUp *model.TopUp, username string, usd float64, vnd int64, qrUrl string) {
	if setting.TelegramBotToken == "" || setting.TelegramAdminId == 0 {
		return
	}

	loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
	timeStr := time.Now().In(loc).Format("15:04:05 02/01/2006")

	text := fmt.Sprintf(
		"🔔 <b>ĐƠN NẠP VIETQR MỚI</b>\n\n"+
			"🔖 <b>Mã đơn:</b> <code>%s</code>\n"+
			"👤 <b>Khách hàng:</b> <code>%s</code> (ID: %d)\n"+
			"💵 <b>Số tiền:</b> <b>%s VNĐ</b> (~$%.2f USD)\n"+
			"🏦 <b>Ngân hàng:</b> MBBank - <code>%s</code>\n"+
			"📝 <b>Cú pháp CK:</b> <code>%s</code>\n"+
			"⏰ <b>Thời gian:</b> %s\n\n"+
			"<i>👉 Vui lòng kiểm tra tài khoản ngân hàng trước khi bấm Duyệt.</i>",
		topUp.TradeNo,
		username,
		topUp.UserId,
		formatVND(vnd),
		usd,
		setting.VietQRAccountNo,
		topUp.TradeNo,
		timeStr,
	)

	inlineKeyboard := map[string]interface{}{
		"inline_keyboard": [][]map[string]string{
			{
				{
					"text":          "✅ Duyệt nạp / Approve",
					"callback_data": fmt.Sprintf("approve:%s", topUp.TradeNo),
				},
				{
					"text":          "❌ Hủy đơn / Cancel",
					"callback_data": fmt.Sprintf("cancel:%s", topUp.TradeNo),
				},
			},
		},
	}

	reqBody := map[string]interface{}{
		"chat_id":      setting.TelegramAdminId,
		"text":         text,
		"parse_mode":   "HTML",
		"reply_markup": inlineKeyboard,
	}

	payload, _ := common.Marshal(reqBody)
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", setting.TelegramBotToken)
	http.Post(url, "application/json", bytes.NewReader(payload))
}

func formatVND(n int64) string {
	in := strconv.FormatInt(n, 10)
	var out []byte
	l := len(in)
	for i, c := range in {
		if i > 0 && (l-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, byte(c))
	}
	return string(out)
}

// StartTelegramBotWorker runs long-polling worker to listen for Admin callbacks
func StartTelegramBotWorker() {
	telegramPollerMu.Lock()
	if telegramPollerStarted {
		telegramPollerMu.Unlock()
		return
	}
	telegramPollerStarted = true
	telegramPollerMu.Unlock()

	go func() {
		offset := 0
		client := &http.Client{Timeout: 35 * time.Second}

		if setting.TelegramBotToken != "" {
			registerTelegramCommands(setting.TelegramBotToken)
		}

		for {
			token := setting.TelegramBotToken
			adminId := setting.TelegramAdminId
			if token == "" || adminId == 0 {
				time.Sleep(10 * time.Second)
				continue
			}

			url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=25", token, offset)
			resp, err := client.Get(url)
			if err != nil {
				time.Sleep(3 * time.Second)
				continue
			}

			body, err := io.ReadAll(resp.Body)
			resp.Body.Close()
			if err != nil {
				time.Sleep(3 * time.Second)
				continue
			}

			var tgResponse struct {
				Ok     bool `json:"ok"`
				Result []struct {
					UpdateId      int `json:"update_id"`
					CallbackQuery *struct {
						Id      string `json:"id"`
						From    struct {
							Id        int64  `json:"id"`
							Username  string `json:"username"`
							FirstName string `json:"first_name"`
						} `json:"from"`
						Message struct {
							MessageId int `json:"message_id"`
							Chat      struct {
								Id int64 `json:"id"`
							} `json:"chat"`
							Text string `json:"text"`
						} `json:"message"`
						Data string `json:"data"`
					} `json:"callback_query"`
					Message *struct {
						MessageId int `json:"message_id"`
						From      struct {
							Id        int64  `json:"id"`
							Username  string `json:"username"`
							FirstName string `json:"first_name"`
						} `json:"from"`
						Chat struct {
							Id int64 `json:"id"`
						} `json:"chat"`
						Text string `json:"text"`
					} `json:"message"`
				} `json:"result"`
			}

			if err := common.Unmarshal(body, &tgResponse); err != nil || !tgResponse.Ok {
				time.Sleep(3 * time.Second)
				continue
			}

			for _, update := range tgResponse.Result {
				if update.UpdateId >= offset {
					offset = update.UpdateId + 1
				}

				// 1. Handle Inline Callback Queries (Approve / Cancel buttons)
				if cb := update.CallbackQuery; cb != nil {
					if cb.From.Id != adminId {
						answerTelegramCallback(token, cb.Id, "🚫 Bạn không có quyền thực hiện thao tác này!")
						continue
					}

					parts := strings.Split(cb.Data, ":")
					if len(parts) != 2 {
						continue
					}

					action, tradeNo := parts[0], parts[1]
					topUp := model.GetTopUpByTradeNo(tradeNo)
					if topUp == nil {
						answerTelegramCallback(token, cb.Id, "⚠️ Đơn nạp không tồn tại!")
						continue
					}

					if action == "approve" {
						if topUp.Status == common.TopUpStatusSuccess {
							answerTelegramCallback(token, cb.Id, "ℹ️ Đơn nạp này đã được duyệt trước đó.")
							continue
						}

						if err := model.RechargeVietQR(tradeNo, "telegram_admin"); err != nil {
							answerTelegramCallback(token, cb.Id, "❌ Lỗi duyệt nạp: "+err.Error())
							continue
						}

						answerTelegramCallback(token, cb.Id, "✅ Đã duyệt nạp & cộng Quota thành công!")
						loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
						timeApproved := time.Now().In(loc).Format("15:04:05 02/01/2006")
						editedText := fmt.Sprintf(
							"✅ <b>ĐÃ DUYỆT NẠP THÀNH CÔNG</b>\n\n"+
								"🔖 <b>Mã đơn:</b> <code>%s</code>\n"+
								"👤 <b>User ID:</b> <code>%d</code>\n"+
								"💵 <b>Số tiền:</b> <b>%s VNĐ</b> (~$%.2f USD)\n"+
								"⚡ <b>Trạng thái:</b> Quota đã cộng vào ví khách hàng!\n"+
								"⏰ <b>Duyệt lúc:</b> %s bởi @%s",
							tradeNo,
							topUp.UserId,
							formatVND(int64(topUp.Money)),
							float64(topUp.Amount),
							timeApproved,
							cb.From.Username,
						)
						editTelegramMessage(token, cb.Message.Chat.Id, cb.Message.MessageId, editedText)
					} else if action == "cancel" {
						if topUp.Status == common.TopUpStatusSuccess {
							answerTelegramCallback(token, cb.Id, "⚠️ Không thể hủy đơn đã thành công.")
							continue
						}

						_ = model.UpdatePendingTopUpStatus(tradeNo, model.PaymentProviderVietQR, common.TopUpStatusFailed)
						answerTelegramCallback(token, cb.Id, "❌ Đã hủy đơn nạp.")
						editedText := fmt.Sprintf("❌ <b>ĐÃ HỦY ĐƠN NẠP (#%s)</b>\nĐơn đã bị từ chối/hủy bởi admin.", tradeNo)
						editTelegramMessage(token, cb.Message.Chat.Id, cb.Message.MessageId, editedText)
					}
					continue
				}

				// 2. Handle Text Messages & Command Buttons
				if msg := update.Message; msg != nil && msg.Text != "" {
					if msg.From.Id != adminId {
						sendTelegramTextMessage(token, msg.Chat.Id, "🚫 <b>Truy cập bị từ chối:</b> Bạn không phải là quản trị viên của hệ thống này.", nil)
						continue
					}
					handleTelegramAdminMessage(token, adminId, msg.Chat.Id, msg.From.Id, msg.From.Username, msg.From.FirstName, strings.TrimSpace(msg.Text))
				}
			}
		}
	}()
}

func registerTelegramCommands(token string) {
	if token == "" {
		return
	}
	url := fmt.Sprintf("https://api.telegram.org/bot%s/setMyCommands", token)
	commands := []map[string]string{
		{"command": "stats", "description": "📊 Thống kê doanh thu & nạp tiền"},
		{"command": "apistats", "description": "🤖 Thống kê AI API, Tokens & Kênh"},
		{"command": "channels", "description": "📡 Danh sách kênh AI & Trạng thái"},
		{"command": "recent", "description": "🕒 10 đơn nạp mới nhất"},
		{"command": "rates", "description": "💵 Tỷ giá USD/VND & Cấu hình nạp"},
		{"command": "order", "description": "🔍 Tra cứu đơn: /order <mã>"},
		{"command": "user", "description": "👤 Tra cứu User: /user <id|username>"},
		{"command": "addquota", "description": "➕ Nạp tiền User: /addquota <id> <usd>"},
		{"command": "banned", "description": "🛡️ Danh sách IP đang bị khóa"},
		{"command": "unban", "description": "🔓 Mở khóa: /unban <ip|user_id>"},
		{"command": "id", "description": "🆔 Xem Telegram ID của bạn"},
		{"command": "help", "description": "❓ Menu trợ giúp & Bàn phím"},
	}
	body, _ := common.Marshal(map[string]interface{}{"commands": commands})
	http.Post(url, "application/json", bytes.NewReader(body))
}

func getChannelTypeName(channelType int) string {
	switch channelType {
	case 1:
		return "OpenAI"
	case 2:
		return "Midjourney"
	case 3:
		return "Azure OpenAI"
	case 4:
		return "Ollama"
	case 14:
		return "Anthropic Claude"
	case 20:
		return "OpenRouter"
	case 24:
		return "Google Gemini"
	case 27:
		return "Perplexity"
	case 33:
		return "AWS Bedrock"
	case 34:
		return "Cohere"
	case 40:
		return "SiliconFlow"
	case 41:
		return "Vertex AI"
	case 42:
		return "Mistral"
	case 43:
		return "DeepSeek"
	case 48:
		return "xAI (Grok)"
	case 54:
		return "Cloudflare"
	case 57:
		return "Together AI"
	default:
		return fmt.Sprintf("Type %d", channelType)
	}
}

func getAdminReplyKeyboard() map[string]interface{} {
	return map[string]interface{}{
		"keyboard": [][]map[string]string{
			{{"text": "📊 Doanh thu"}, {"text": "🤖 Thống kê API"}},
			{{"text": "🕒 Đơn gần đây"}, {"text": "💵 Tỷ giá & Phí"}},
			{{"text": "🔍 Tra cứu đơn"}, {"text": "👤 Tra cứu User"}},
		},
		"resize_keyboard": true,
		"is_persistent":   true,
	}
}

func handleTelegramAdminMessage(token string, adminId int64, chatId int64, fromId int64, username, firstName, text string) {
	lowerText := strings.ToLower(text)

	switch {
	case lowerText == "/start" || lowerText == "/help" || lowerText == "/menu" || strings.Contains(lowerText, "trợ giúp"):
		msg := fmt.Sprintf(
			"👋 <b>Xin chào Admin @%s!</b>\n\n"+
				"Chào mừng bạn đến với bảng điều khiển <b>Keichan API Gateway</b>.\n\n"+
				"⚡ <b>Danh sách lệnh khả dụng:</b>\n"+
				"• <code>/stats</code> — 📊 Báo cáo doanh thu & nạp tiền\n"+
				"• <code>/apistats</code> — 🤖 Thống kê AI API, Tokens & Lưu lượng\n"+
				"• <code>/channels</code> — 📡 Danh sách kênh AI & Độ trễ\n"+
				"• <code>/recent</code> — 🕒 Danh sách 10 đơn nạp gần nhất\n"+
				"• <code>/rates</code> — 💵 Kiểm tra tỷ giá USD/VND thị trường\n"+
				"• <code>/order &lt;mã&gt;</code> — 🔍 Tra cứu chi tiết đơn nạp\n"+
				"• <code>/user &lt;id|username&gt;</code> — 👤 Tra cứu thông tin người dùng\n"+
				"• <code>/addquota &lt;id&gt; &lt;usd&gt;</code> — ➕ Nạp tiền nhanh cho User\n"+
				"• <code>/banned</code> — 🛡️ Danh sách IP đang bị khóa\n"+
				"• <code>/unban &lt;ip|user_id&gt;</code> — 🔓 Mở khóa IP / Kích hoạt User\n"+
				"• <code>/id</code> — 🆔 Xem Telegram ID của bạn\n\n"+
				"👇 <i>Bạn có thể bấm trực tiếp các nút trên Bàn phím bên dưới để thao tác nhanh:</i>",
			username,
		)
		sendTelegramTextMessage(token, chatId, msg, getAdminReplyKeyboard())

	case lowerText == "/apistats" || lowerText == "/api" || text == "🤖 Thống kê API" || strings.Contains(lowerText, "thống kê api"):
		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		now := time.Now().In(loc)
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).Unix()

		// 1. Requests & Traffic
		var totalRequests int64
		model.LOG_DB.Table("logs").Where("type = ?", model.LogTypeConsume).Count(&totalRequests)

		var todayRequests int64
		model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, startOfDay).Count(&todayRequests)

		var rpm, tpm int64
		_ = model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, time.Now().Add(-60*time.Second).Unix()).
			Select("count(*), coalesce(sum(prompt_tokens + completion_tokens), 0)").Row().Scan(&rpm, &tpm)

		var avgLatency float64
		_ = model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, startOfDay).
			Select("coalesce(avg(use_time), 0)").Scan(&avgLatency)

		// 2. Tokens & Quota
		var totalQuotaUsed int64
		_ = model.LOG_DB.Table("logs").Where("type = ?", model.LogTypeConsume).Select("coalesce(sum(quota), 0)").Scan(&totalQuotaUsed)

		var todayQuotaUsed int64
		_ = model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, startOfDay).Select("coalesce(sum(quota), 0)").Scan(&todayQuotaUsed)

		var totalPromptTokens, totalCompTokens int64
		_ = model.LOG_DB.Table("logs").Where("type = ?", model.LogTypeConsume).
			Select("coalesce(sum(prompt_tokens), 0), coalesce(sum(completion_tokens), 0)").Row().Scan(&totalPromptTokens, &totalCompTokens)

		var todayPromptTokens, todayCompTokens int64
		_ = model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, startOfDay).
			Select("coalesce(sum(prompt_tokens), 0), coalesce(sum(completion_tokens), 0)").Row().Scan(&todayPromptTokens, &todayCompTokens)

		totalTokensSum := totalPromptTokens + totalCompTokens
		todayTokensSum := todayPromptTokens + todayCompTokens
		todayQuotaUSD := float64(todayQuotaUsed) / float64(common.QuotaPerUnit)
		totalQuotaUSD := float64(totalQuotaUsed) / float64(common.QuotaPerUnit)

		// 3. Top 5 Models
		type ModelStat struct {
			ModelName string
			Count     int64
			Quota     int64
		}
		var topModels []ModelStat
		_ = model.LOG_DB.Table("logs").Where("type = ? AND created_at >= ?", model.LogTypeConsume, startOfDay).
			Select("model_name, count(*) as count, sum(quota) as quota").Group("model_name").Order("count desc").Limit(5).Scan(&topModels)
		if len(topModels) == 0 {
			_ = model.LOG_DB.Table("logs").Where("type = ?", model.LogTypeConsume).
				Select("model_name, count(*) as count, sum(quota) as quota").Group("model_name").Order("count desc").Limit(5).Scan(&topModels)
		}

		var topModelsStr strings.Builder
		if len(topModels) > 0 {
			for i, m := range topModels {
				mUSD := float64(m.Quota) / float64(common.QuotaPerUnit)
				topModelsStr.WriteString(fmt.Sprintf("• <code>%s</code>: <b>%d reqs</b> ($%.4f)\n", m.ModelName, m.Count, mUSD))
				if i >= 4 {
					break
				}
			}
		} else {
			topModelsStr.WriteString("• <i>Chưa có dữ liệu gọi mô hình</i>\n")
		}

		// 4. Channels
		var totalChannels, enabledChannels, disabledChannels int64
		model.DB.Model(&model.Channel{}).Count(&totalChannels)
		model.DB.Model(&model.Channel{}).Where("status = ?", common.ChannelStatusEnabled).Count(&enabledChannels)
		model.DB.Model(&model.Channel{}).Where("status != ?", common.ChannelStatusEnabled).Count(&disabledChannels)

		// 5. Users & Tokens & System
		var totalUsers, totalTokens int64
		model.DB.Model(&model.User{}).Count(&totalUsers)
		model.DB.Model(&model.Token{}).Count(&totalTokens)
		bannedCount := len(middleware.GetBannedIPs())

		uptimeSec := time.Now().Unix() - common.StartTime
		uptimeStr := fmt.Sprintf("%d giờ %d phút", uptimeSec/3600, (uptimeSec%3600)/60)

		var mem runtime.MemStats
		runtime.ReadMemStats(&mem)
		allocMB := float64(mem.Alloc) / 1024 / 1024
		sysMB := float64(mem.Sys) / 1024 / 1024
		goroutines := runtime.NumGoroutine()

		apiStatsMsg := fmt.Sprintf(
			"🤖 <b>THỐNG KÊ LƯU LƯỢNG API & HỆ THỐNG</b>\n"+
				"⏰ <i>Cập nhật: %s</i>\n\n"+
				"⚡ <b>LƯU LƯỢNG REQUEST AI:</b>\n"+
				"• Hôm nay: <b>%d requests</b> (TB: <b>%.0f ms</b>)\n"+
				"• Tốc độ hiện tại: <b>%d RPM</b> | <b>%d TPM</b>\n"+
				"• Tổng toàn thời gian: <b>%d requests</b>\n\n"+
				"🪙 <b>TIÊU THỤ TOKEN & CHI PHÍ:</b>\n"+
				"• Token hôm nay: <b>%s tokens</b> ($%.4f USD)\n"+
				"  └ Input: %s | Output: %s\n"+
				"• Tổng token đã dùng: <b>%s tokens</b> ($%.4f USD)\n\n"+
				"🏆 <b>TOP MÔ HÌNH THỊNH HÀNH:</b>\n%s\n"+
				"📡 <b>HẠ TẦNG KÊNH (CHANNELS):</b>\n"+
				"• Tổng số kênh: <b>%d kênh</b> (🟢 <b>%d bật</b> | 🔴 <b>%d tắt</b>)\n"+
				"• Xem chi tiết: <code>/channels</code>\n\n"+
				"👥 <b>QUY MÔ HỆ THỐNG:</b>\n"+
				"• Tổng Users: <b>%d</b> | Tổng API Keys: <b>%d</b>\n"+
				"• IP đang bị khóa (Auto-Ban): <b>%d</b>\n\n"+
				"💻 <b>TÀI NGUYÊN MÁY CHỦ:</b>\n"+
				"• Uptime: <b>%s</b>\n"+
				"• RAM: <b>%.1f MB</b> / %.1f MB | Goroutines: <b>%d</b>",
			now.Format("15:04:05 02/01/2006"),
			todayRequests,
			avgLatency,
			rpm,
			tpm,
			totalRequests,
			formatVND(todayTokensSum),
			todayQuotaUSD,
			formatVND(todayPromptTokens),
			formatVND(todayCompTokens),
			formatVND(totalTokensSum),
			totalQuotaUSD,
			topModelsStr.String(),
			totalChannels,
			enabledChannels,
			disabledChannels,
			totalUsers,
			totalTokens,
			bannedCount,
			uptimeStr,
			allocMB,
			sysMB,
			goroutines,
		)
		sendTelegramTextMessage(token, chatId, apiStatsMsg, getAdminReplyKeyboard())

	case lowerText == "/channels" || lowerText == "/channel" || strings.Contains(lowerText, "kênh ai"):
		var channels []model.Channel
		model.DB.Order("priority desc, id asc").Find(&channels)

		if len(channels) == 0 {
			sendTelegramTextMessage(token, chatId, "ℹ️ Hiện chưa có kênh AI nào được cấu hình trong hệ thống.", getAdminReplyKeyboard())
			return
		}

		var sb strings.Builder
		sb.WriteString("📡 <b>DANH SÁCH KÊNH AI (CHANNELS):</b>\n\n")

		for i, ch := range channels {
			statusIcon := "🟢"
			statusText := "Đang bật"
			if ch.Status != common.ChannelStatusEnabled {
				statusIcon = "🔴"
				statusText = "Tạm tắt"
			}

			typeStr := getChannelTypeName(ch.Type)
			sb.WriteString(fmt.Sprintf(
				"%d. %s <b>%s</b> (#%d)\n"+
					"   └ Loại: <code>%s</code> | Nhóm: <code>%s</code>\n"+
					"   └ Trạng thái: %s | Độ trễ: <b>%d ms</b> | Ưu tiên: <b>%d</b>\n\n",
				i+1,
				statusIcon,
				ch.Name,
				ch.Id,
				typeStr,
				ch.Group,
				statusText,
				ch.ResponseTime,
				ch.Priority,
			))
		}

		sendTelegramTextMessage(token, chatId, strings.TrimSpace(sb.String()), getAdminReplyKeyboard())

	case lowerText == "/stats" || lowerText == "/doanhthu" || text == "📊 Doanh thu" || strings.Contains(lowerText, "doanh thu"):
		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		now := time.Now().In(loc)
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).Unix()
		startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, loc).Unix()

		var totalUsers int64
		model.DB.Model(&model.User{}).Count(&totalUsers)

		var totalSuccessTopups int64
		model.DB.Model(&model.TopUp{}).Where("status = ?", common.TopUpStatusSuccess).Count(&totalSuccessTopups)

		var pendingTopups int64
		model.DB.Model(&model.TopUp{}).Where("status = ?", common.TopUpStatusPending).Count(&pendingTopups)

		var totalUSD float64
		model.DB.Model(&model.TopUp{}).Where("status = ?", common.TopUpStatusSuccess).Select("coalesce(sum(amount), 0)").Scan(&totalUSD)

		var totalVND float64
		model.DB.Model(&model.TopUp{}).Where("status = ?", common.TopUpStatusSuccess).Select("coalesce(sum(money), 0)").Scan(&totalVND)

		var todayUSD float64
		model.DB.Model(&model.TopUp{}).Where("status = ? AND create_time >= ?", common.TopUpStatusSuccess, startOfDay).Select("coalesce(sum(amount), 0)").Scan(&todayUSD)

		var todayVND float64
		model.DB.Model(&model.TopUp{}).Where("status = ? AND create_time >= ?", common.TopUpStatusSuccess, startOfDay).Select("coalesce(sum(money), 0)").Scan(&todayVND)

		var todayOrders int64
		model.DB.Model(&model.TopUp{}).Where("status = ? AND create_time >= ?", common.TopUpStatusSuccess, startOfDay).Count(&todayOrders)

		var monthUSD float64
		model.DB.Model(&model.TopUp{}).Where("status = ? AND create_time >= ?", common.TopUpStatusSuccess, startOfMonth).Select("coalesce(sum(amount), 0)").Scan(&monthUSD)

		var monthVND float64
		model.DB.Model(&model.TopUp{}).Where("status = ? AND create_time >= ?", common.TopUpStatusSuccess, startOfMonth).Select("coalesce(sum(money), 0)").Scan(&monthVND)

		statsMsg := fmt.Sprintf(
			"📊 <b>BÁO CÁO DOANH THU & NẠP TIỀN</b>\n"+
				"⏰ <i>Cập nhật: %s</i>\n\n"+
				"☀️ <b>HÔM NAY (%s):</b>\n"+
				"• Đơn thành công: <b>%d đơn</b>\n"+
				"• Doanh thu: <b>%s VNĐ</b> (~$%.2f USD)\n\n"+
				"📅 <b>THÁNG NÀY (%02d/%d):</b>\n"+
				"• Doanh thu: <b>%s VNĐ</b> (~$%.2f USD)\n\n"+
				"📈 <b>TỔNG TOÀN THỜI GIAN:</b>\n"+
				"• Tổng người dùng: <b>%d users</b>\n"+
				"• Đơn nạp thành công: <b>%d đơn</b>\n"+
				"• Đơn đang chờ xử lý: <b>%d đơn</b>\n"+
				"• Tổng doanh thu: <b>%s VNĐ</b> (~$%.2f USD)",
			now.Format("15:04:05 02/01/2006"),
			now.Format("02/01/2006"),
			todayOrders,
			formatVND(int64(todayVND)),
			todayUSD,
			now.Month(),
			now.Year(),
			formatVND(int64(monthVND)),
			monthUSD,
			totalUsers,
			totalSuccessTopups,
			pendingTopups,
			formatVND(int64(totalVND)),
			totalUSD,
		)
		sendTelegramTextMessage(token, chatId, statsMsg, getAdminReplyKeyboard())

	case lowerText == "/recent" || strings.Contains(lowerText, "đơn gần đây"):
		var topups []model.TopUp
		model.DB.Order("id desc").Limit(10).Find(&topups)

		if len(topups) == 0 {
			sendTelegramTextMessage(token, chatId, "ℹ️ Chưa có đơn nạp nào trong hệ thống.", getAdminReplyKeyboard())
			return
		}

		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		var sb strings.Builder
		sb.WriteString("🕒 <b>10 ĐƠN NẠP MỚI NHẤT:</b>\n\n")

		for i, topUp := range topups {
			statusIcon := "⏳"
			if topUp.Status == common.TopUpStatusSuccess {
				statusIcon = "✅"
			} else if topUp.Status == common.TopUpStatusFailed || topUp.Status == "canceled" {
				statusIcon = "❌"
			}

			tStr := time.Unix(topUp.CreateTime, 0).In(loc).Format("15:04 02/01")
			sb.WriteString(fmt.Sprintf(
				"%d. %s <code>%s</code> | <b>%s VNĐ</b> ($%d) | User <code>#%d</code> | %s\n",
				i+1,
				statusIcon,
				topUp.TradeNo,
				formatVND(int64(topUp.Money)),
				topUp.Amount,
				topUp.UserId,
				tStr,
			))
		}

		sb.WriteString("\n💡 <i>Gõ <code>/order &lt;mã_đơn&gt;</code> để xem chi tiết hoặc duyệt đơn.</i>")
		sendTelegramTextMessage(token, chatId, sb.String(), getAdminReplyKeyboard())

	case lowerText == "/rates" || strings.Contains(lowerText, "tỷ giá"):
		rate := FetchLiveUSDTVNDRate()
		feeRatio := setting.VietQRInfraFeeRatio
		effectiveRate := math.Round(rate * (1 + feeRatio))

		var lastTopup model.TopUp
		lastOrderRateStr := "Chưa có đơn nạp"
		if err := model.DB.Where("payment_method = ? AND amount > 0 AND money > 0", "vietqr").Order("id desc").First(&lastTopup).Error; err == nil {
			unitRate := lastTopup.Money / float64(lastTopup.Amount)
			lastOrderRateStr = fmt.Sprintf("<b>%s VNĐ/USD</b> (Đơn <code>#%s</code>)", formatVND(int64(math.Round(unitRate))), lastTopup.TradeNo)
		}

		ratesMsg := fmt.Sprintf(
			"💵 <b>THÔNG TIN TỶ GIÁ & CẤU HÌNH NẠP</b>\n\n"+
				"🌐 <b>Tỷ giá gốc USDT (P2P/CoinGecko):</b> <code>1 USD = %s VNĐ</code>\n"+
				"⚡ <b>Phí duy trì hạ tầng:</b> <code>+%.0f%%</code>\n"+
				"🏷️ <b>Tỷ giá áp dụng hiện tại:</b> <b>%s VNĐ/USD</b>\n"+
				"🕒 <b>Tỷ giá đơn nạp gần nhất:</b> %s\n\n"+
				"🏦 <b>Ngân hàng nhận:</b> <b>%s</b>\n"+
				"💳 <b>Số tài khoản:</b> <code>%s</code>\n"+
				"👤 <b>Tên chủ tài khoản:</b> <code>%s</code>\n"+
				"🪙 <b>Mức nạp tối thiểu:</b> <b>$%d USD</b>",
			formatVND(int64(math.Round(rate))),
			feeRatio*100,
			formatVND(int64(effectiveRate)),
			lastOrderRateStr,
			setting.VietQRBankId,
			setting.VietQRAccountNo,
			setting.VietQRAccountName,
			setting.VietQRMinTopUp,
		)
		sendTelegramTextMessage(token, chatId, ratesMsg, getAdminReplyKeyboard())

	case text == "🔍 Tra cứu đơn" || lowerText == "/order" || lowerText == "/track":
		sendTelegramTextMessage(token, chatId, "💡 <b>Hướng dẫn tra cứu đơn nạp:</b>\nCú pháp: <code>/order &lt;mã_đơn&gt;</code>\nVí dụ: <code>/order KC8F92A1</code>\n\n<i>(Hoặc bạn chỉ cần dán thẳng mã đơn KC... vào đây)</i>", getAdminReplyKeyboard())

	case strings.HasPrefix(lowerText, "/order ") || strings.HasPrefix(lowerText, "/track "):
		tradeNo := strings.ToUpper(strings.TrimSpace(text[strings.Index(text, " ")+1:]))
		topUp := model.GetTopUpByTradeNo(tradeNo)
		if topUp == nil {
			sendTelegramTextMessage(token, chatId, fmt.Sprintf("⚠️ Không tìm thấy đơn nạp với mã: <code>%s</code>", tradeNo), getAdminReplyKeyboard())
			return
		}

		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		createdStr := time.Unix(topUp.CreateTime, 0).In(loc).Format("15:04:05 02/01/2006")
		statusText := "⏳ Đang chờ thanh toán (Pending)"
		if topUp.Status == common.TopUpStatusSuccess {
			statusText = "✅ Đã thanh toán & duyệt thành công"
		} else if topUp.Status == common.TopUpStatusFailed {
			statusText = "❌ Đã hủy / Thất bại"
		}

		orderMsg := fmt.Sprintf(
			"🔍 <b>CHI TIẾT ĐƠN NẠP (#%s)</b>\n\n"+
				"👤 <b>User ID:</b> <code>%d</code>\n"+
				"💵 <b>Số tiền nạp:</b> <b>%s VNĐ</b> (~$%d USD)\n"+
				"💳 <b>Cổng thanh toán:</b> <code>%s</code>\n"+
				"⚡ <b>Trạng thái:</b> %s\n"+
				"⏰ <b>Thời gian tạo:</b> %s",
			topUp.TradeNo,
			topUp.UserId,
			formatVND(int64(topUp.Money)),
			topUp.Amount,
			topUp.PaymentMethod,
			statusText,
			createdStr,
		)

		if topUp.Status == common.TopUpStatusPending {
			inlineKeyboard := map[string]interface{}{
				"inline_keyboard": [][]map[string]string{
					{
						{"text": "✅ Duyệt nạp ngay", "callback_data": fmt.Sprintf("approve:%s", topUp.TradeNo)},
						{"text": "❌ Hủy đơn", "callback_data": fmt.Sprintf("cancel:%s", topUp.TradeNo)},
					},
				},
			}
			sendTelegramTextMessage(token, chatId, orderMsg, inlineKeyboard)
		} else {
			sendTelegramTextMessage(token, chatId, orderMsg, getAdminReplyKeyboard())
		}

	case text == "👤 Tra cứu User" || lowerText == "/user":
		sendTelegramTextMessage(token, chatId, "💡 <b>Hướng dẫn tra cứu User:</b>\nCú pháp: <code>/user &lt;id hoặc username&gt;</code>\nVí dụ: <code>/user 3</code> hoặc <code>/user planamusic771</code>", getAdminReplyKeyboard())

	case strings.HasPrefix(lowerText, "/user "):
		query := strings.TrimSpace(text[6:])
		var targetUser *model.User
		var err error

		if id, convErr := strconv.Atoi(query); convErr == nil {
			targetUser, err = model.GetUserById(id, true)
		} else {
			var u model.User
			if err = model.DB.Where("username = ?", query).First(&u).Error; err == nil {
				targetUser = &u
			}
		}

		if err != nil || targetUser == nil {
			sendTelegramTextMessage(token, chatId, fmt.Sprintf("⚠️ Không tìm thấy người dùng: <code>%s</code>", query), getAdminReplyKeyboard())
			return
		}

		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		regDate := "N/A"
		if targetUser.CreatedAt != 0 {
			regDate = time.Unix(targetUser.CreatedAt, 0).In(loc).Format("15:04 02/01/2006")
		}

		quotaUSD := float64(targetUser.Quota) / float64(common.QuotaPerUnit)
		roleName := "Người dùng (User)"
		if targetUser.Role == common.RoleAdminUser {
			roleName = "Quản trị viên (Admin)"
		} else if targetUser.Role == common.RoleRootUser {
			roleName = "Root Admin"
		}

		userMsg := fmt.Sprintf(
			"👤 <b>THÔNG TIN NGƯỜI DÙNG</b>\n\n"+
				"🆔 <b>User ID:</b> <code>%d</code>\n"+
				"📛 <b>Username:</b> <code>%s</code>\n"+
				"🏷️ <b>Tên hiển thị:</b> %s\n"+
				"📧 <b>Email:</b> <code>%s</code>\n"+
				"💰 <b>Số dư tài khoản:</b> <b>$%.4f USD</b>\n"+
				"👥 <b>Nhóm (Group):</b> <code>%s</code>\n"+
				"🛡️ <b>Vai trò:</b> %s\n"+
				"📅 <b>Ngày đăng ký:</b> %s",
			targetUser.Id,
			targetUser.Username,
			targetUser.DisplayName,
			targetUser.Email,
			quotaUSD,
			targetUser.Group,
			roleName,
			regDate,
		)
		sendTelegramTextMessage(token, chatId, userMsg, getAdminReplyKeyboard())

	case strings.HasPrefix(lowerText, "/addquota"):
		parts := strings.Fields(text)
		if len(parts) < 3 {
			sendTelegramTextMessage(token, chatId, "💡 <b>Cú pháp nạp tiền cho User:</b>\n<code>/addquota &lt;user_id&gt; &lt;số_usd&gt;</code>\nVí dụ: <code>/addquota 3 10</code> (Cộng $10 USD cho User ID 3)", getAdminReplyKeyboard())
			return
		}

		userId, err := strconv.Atoi(parts[1])
		if err != nil || userId <= 0 {
			sendTelegramTextMessage(token, chatId, "❌ User ID không hợp lệ.", getAdminReplyKeyboard())
			return
		}

		amountUSD, err := strconv.ParseFloat(parts[2], 64)
		if err != nil || amountUSD <= 0 {
			sendTelegramTextMessage(token, chatId, "❌ Số tiền USD phải lớn hơn 0.", getAdminReplyKeyboard())
			return
		}

		targetUser, err := model.GetUserById(userId, true)
		if err != nil || targetUser == nil {
			sendTelegramTextMessage(token, chatId, fmt.Sprintf("⚠️ Không tìm thấy User ID <code>%d</code>", userId), getAdminReplyKeyboard())
			return
		}

		quotaToAdd, err := common.QuotaFromDecimalStrict(
			decimal.NewFromFloat(amountUSD).Mul(decimal.NewFromFloat(common.QuotaPerUnit)),
		)
		if err != nil {
			sendTelegramTextMessage(token, chatId, "❌ Lỗi tính toán hạn mức.", getAdminReplyKeyboard())
			return
		}

		if err := model.IncreaseUserQuota(userId, quotaToAdd, true); err != nil {
			sendTelegramTextMessage(token, chatId, "❌ Lỗi cộng tiền: "+err.Error(), getAdminReplyKeyboard())
			return
		}

		newQuotaUSD := float64(targetUser.Quota+quotaToAdd) / float64(common.QuotaPerUnit)
		successMsg := fmt.Sprintf(
			"✅ <b>ĐÃ CỘNG TIỀN VÀO TÀI KHOẢN!</b>\n\n"+
				"👤 <b>User:</b> <code>#%d</code> (@%s)\n"+
				"➕ <b>Đã cộng thêm:</b> <b>+$%.2f USD</b>\n"+
				"💰 <b>Số dư mới:</b> <b>$%.4f USD</b>",
			targetUser.Id,
			targetUser.Username,
			amountUSD,
			newQuotaUSD,
		)
		sendTelegramTextMessage(token, chatId, successMsg, getAdminReplyKeyboard())

	case lowerText == "/id" || strings.Contains(lowerText, "my id"):
		idMsg := fmt.Sprintf(
			"🆔 <b>THÔNG TIN TELEGRAM CỦA BẠN</b>\n\n"+
				"👤 <b>User ID:</b> <code>%d</code>\n"+
				"💬 <b>Chat ID:</b> <code>%d</code>\n"+
				"📛 <b>Tên:</b> %s\n"+
				"🔗 <b>Username:</b> @%s\n"+
				"🛡️ <b>Trạng thái:</b> ✅ Quản trị viên tối cao (Admin)",
			fromId,
			chatId,
			firstName,
			username,
		)
		sendTelegramTextMessage(token, chatId, idMsg, getAdminReplyKeyboard())

	case lowerText == "/banned":
		banned := middleware.GetBannedIPs()
		if len(banned) == 0 {
			sendTelegramTextMessage(token, chatId, "🛡️ Hiện tại không có IP nào bị khóa (Auto-Ban).", getAdminReplyKeyboard())
			return
		}
		loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
		var sb strings.Builder
		sb.WriteString("🛡️ <b>DANH SÁCH IP ĐANG BỊ KHÓA (AUTO-BAN):</b>\n\n")
		for ip, exp := range banned {
			sb.WriteString(fmt.Sprintf("• <code>%s</code> — Hết hạn: %s\n", ip, exp.In(loc).Format("15:04:05 02/01")))
		}
		sb.WriteString("\n💡 <i>Gõ <code>/unban &lt;ip&gt;</code> để mở khóa nhanh.</i>")
		sendTelegramTextMessage(token, chatId, sb.String(), getAdminReplyKeyboard())

	case strings.HasPrefix(lowerText, "/unban"):
		parts := strings.Fields(text)
		if len(parts) < 2 {
			sendTelegramTextMessage(token, chatId, "💡 <b>Cú pháp mở khóa:</b>\n<code>/unban &lt;ip hoặc user_id&gt;</code>\nVí dụ: <code>/unban 113.160.224.1</code> hoặc <code>/unban 3</code>", getAdminReplyKeyboard())
			return
		}
		target := strings.TrimSpace(parts[1])
		middleware.UnbanIP(target)
		if uid, err := strconv.Atoi(target); err == nil {
			_ = model.DB.Model(&model.User{}).Where("id = ?", uid).Update("status", common.UserStatusEnabled)
		} else {
			_ = model.DB.Model(&model.User{}).Where("username = ?", target).Update("status", common.UserStatusEnabled)
		}
		sendTelegramTextMessage(token, chatId, fmt.Sprintf("✅ Đã mở khóa cho: <code>%s</code>", target), getAdminReplyKeyboard())

	default:
		// Auto-detect if user just pasted an order code like KC8F92A1
		codeRe := regexp.MustCompile(`(?i)\bKC[A-Z0-9]{6}\b`)
		if codeMatch := codeRe.FindString(text); codeMatch != "" {
			tradeNo := strings.ToUpper(codeMatch)
			if topUp := model.GetTopUpByTradeNo(tradeNo); topUp != nil {
				loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
				createdStr := time.Unix(topUp.CreateTime, 0).In(loc).Format("15:04:05 02/01/2006")
				statusText := "⏳ Đang chờ thanh toán (Pending)"
				if topUp.Status == common.TopUpStatusSuccess {
					statusText = "✅ Đã thanh toán & duyệt thành công"
				} else if topUp.Status == common.TopUpStatusFailed {
					statusText = "❌ Đã hủy / Thất bại"
				}

				orderMsg := fmt.Sprintf(
					"🔍 <b>TÌM THẤY ĐƠN NẠP (#%s)</b>\n\n"+
						"👤 <b>User ID:</b> <code>%d</code>\n"+
						"💵 <b>Số tiền nạp:</b> <b>%s VNĐ</b> (~$%d USD)\n"+
						"💳 <b>Cổng thanh toán:</b> <code>%s</code>\n"+
						"⚡ <b>Trạng thái:</b> %s\n"+
						"⏰ <b>Thời gian tạo:</b> %s",
					topUp.TradeNo,
					topUp.UserId,
					formatVND(int64(topUp.Money)),
					topUp.Amount,
					topUp.PaymentMethod,
					statusText,
					createdStr,
				)

				if topUp.Status == common.TopUpStatusPending {
					inlineKeyboard := map[string]interface{}{
						"inline_keyboard": [][]map[string]string{
							{
								{"text": "✅ Duyệt nạp ngay", "callback_data": fmt.Sprintf("approve:%s", topUp.TradeNo)},
								{"text": "❌ Hủy đơn", "callback_data": fmt.Sprintf("cancel:%s", topUp.TradeNo)},
							},
						},
					}
					sendTelegramTextMessage(token, chatId, orderMsg, inlineKeyboard)
					return
				}
				sendTelegramTextMessage(token, chatId, orderMsg, getAdminReplyKeyboard())
				return
			}
		}

		sendTelegramTextMessage(token, chatId, "❓ Lệnh không hợp lệ. Vui lòng bấm các nút menu bên dưới hoặc gõ <code>/help</code> để xem hướng dẫn.", getAdminReplyKeyboard())
	}
}

func sendTelegramTextMessage(token string, chatId int64, text string, replyMarkup interface{}) {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	bodyMap := map[string]interface{}{
		"chat_id":    chatId,
		"text":       text,
		"parse_mode": "HTML",
	}
	if replyMarkup != nil {
		bodyMap["reply_markup"] = replyMarkup
	}
	body, _ := common.Marshal(bodyMap)
	http.Post(url, "application/json", bytes.NewReader(body))
}

func answerTelegramCallback(token, callbackId, text string) {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/answerCallbackQuery", token)
	body, _ := common.Marshal(map[string]string{
		"callback_query_id": callbackId,
		"text":              text,
		"show_alert":        "false",
	})
	http.Post(url, "application/json", bytes.NewReader(body))
}

func editTelegramMessage(token string, chatId int64, messageId int, text string) {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/editMessageText", token)
	body, _ := common.Marshal(map[string]interface{}{
		"chat_id":    chatId,
		"message_id": messageId,
		"text":       text,
		"parse_mode": "HTML",
	})
	http.Post(url, "application/json", bytes.NewReader(body))
}

// WebhookVietQR handles automatic bank webhook notifications (e.g., from bank app forwarder / SePay)
func WebhookVietQR(c *gin.Context) {
	// SECURITY: Authenticate webhook caller with secret token
	providedSecret := c.GetHeader("X-Webhook-Secret")
	if providedSecret == "" {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			providedSecret = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if providedSecret == "" {
		providedSecret = c.Query("secret")
	}

	expectedSecret := setting.VietQRWebhookSecret
	if expectedSecret != "" && providedSecret != expectedSecret {
		logger.LogWarn(context.Background(), fmt.Sprintf("[VietQR-Webhook] Unauthorized access attempt from IP: %s", c.ClientIP()))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid body"})
		return
	}

	bodyStr := string(body)
	logger.LogInfo(context.Background(), "[VietQR-Webhook] Received authorized payload: "+bodyStr)

	// 1. Extract ND: (Nội dung chuyển khoản) section specifically if available
	searchTarget := bodyStr
	ndRe := regexp.MustCompile(`(?i)\bND\s*:\s*(.+)`)
	if ndMatches := ndRe.FindStringSubmatch(bodyStr); len(ndMatches) > 1 {
		searchTarget = ndMatches[1]
	}

	// 2. Scan for trade_no anywhere in ND or body (beginning, middle, end, with spaces/dashes)
	codeRe := regexp.MustCompile(`(?i)KC[\s\-_]?([A-Z0-9]{6})`)
	var candidates []string

	// Search in ND: section first
	for _, submatch := range codeRe.FindAllStringSubmatch(searchTarget, -1) {
		if len(submatch) > 1 {
			candidates = append(candidates, "KC"+strings.ToUpper(submatch[1]))
		}
	}

	// Fallback to search in entire payload
	if len(candidates) == 0 {
		for _, submatch := range codeRe.FindAllStringSubmatch(bodyStr, -1) {
			if len(submatch) > 1 {
				candidates = append(candidates, "KC"+strings.ToUpper(submatch[1]))
			}
		}
	}

	for _, candidate := range candidates {
		topUp := model.GetTopUpByTradeNo(candidate)
		if topUp != nil && topUp.Status == common.TopUpStatusPending {
			// SECURITY CHECK: Verify transferred amount from notification text (specifically in GD: section)
			transferredAmount := parseTransferredAmount(bodyStr)
			if transferredAmount > 0 && transferredAmount < topUp.Money-10 {
				logger.LogWarn(context.Background(), fmt.Sprintf("[VietQR-Webhook] Underpaid! Order %s required %.0f VND but received %.0f VND", candidate, topUp.Money, transferredAmount))
				go sendTelegramUnderpaidAlert(topUp, transferredAmount)
				c.JSON(http.StatusBadRequest, gin.H{
					"error":       "insufficient_amount",
					"required":    topUp.Money,
					"transferred": transferredAmount,
				})
				return
			}

			if err := model.RechargeVietQR(candidate, c.ClientIP()); err == nil {
				logger.LogInfo(context.Background(), "[VietQR-Webhook] Successfully recharged order: "+candidate)
				go sendTelegramAutoApprovedAlert(topUp)
				c.JSON(http.StatusOK, gin.H{"success": true, "trade_no": candidate})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "received"})
}

func parseTransferredAmount(text string) float64 {
	// First prioritize matching specifically in GD: section (e.g. "GD: +52,673VND" or "GD: 52,673" or "GD:+52.673")
	gdRe := regexp.MustCompile(`(?i)\bGD\s*:\s*\+?\s*([0-9.,]+)`)
	if matches := gdRe.FindStringSubmatch(text); len(matches) > 1 {
		cleaned := strings.ReplaceAll(matches[1], ",", "")
		cleaned = strings.ReplaceAll(cleaned, ".", "")
		if val, err := strconv.ParseFloat(cleaned, 64); err == nil {
			return val
		}
	}

	// Fallback to matching general "+[amount] VND" pattern
	genRe := regexp.MustCompile(`(?i)\+\s*([0-9.,]+)\s*(?:vnd|vnđ|d|đ)?`)
	if matches := genRe.FindStringSubmatch(text); len(matches) > 1 {
		cleaned := strings.ReplaceAll(matches[1], ",", "")
		cleaned = strings.ReplaceAll(cleaned, ".", "")
		if val, err := strconv.ParseFloat(cleaned, 64); err == nil {
			return val
		}
	}
	return 0
}

func sendTelegramUnderpaidAlert(topUp *model.TopUp, transferredMoney float64) {
	if setting.TelegramBotToken == "" || setting.TelegramAdminId == 0 {
		return
	}

	loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
	timeStr := time.Now().In(loc).Format("15:04:05 02/01/2006")

	text := fmt.Sprintf(
		"⚠️ <b>[CẢNH BÁO] NẠP THIẾU TIỀN (#%s)</b>\n\n"+
			"👤 <b>User ID:</b> <code>%d</code>\n"+
			"💵 <b>Yêu cầu:</b> <b>%s VNĐ</b>\n"+
			"🔻 <b>Thực chuyển:</b> <b>%s VNĐ</b> (Thiếu %s VNĐ)\n"+
			"❌ <b>Trạng thái:</b> Đã chặn tự động duyệt để tránh gian lận!\n"+
			"⏰ <b>Thời gian:</b> %s",
		topUp.TradeNo,
		topUp.UserId,
		formatVND(int64(topUp.Money)),
		formatVND(int64(transferredMoney)),
		formatVND(int64(topUp.Money-transferredMoney)),
		timeStr,
	)

	reqBody := map[string]interface{}{
		"chat_id":    setting.TelegramAdminId,
		"text":       text,
		"parse_mode": "HTML",
	}

	payload, _ := common.Marshal(reqBody)
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", setting.TelegramBotToken)
	http.Post(url, "application/json", bytes.NewReader(payload))
}

func sendTelegramAutoApprovedAlert(topUp *model.TopUp) {
	if setting.TelegramBotToken == "" || setting.TelegramAdminId == 0 {
		return
	}

	loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh")
	timeStr := time.Now().In(loc).Format("15:04:05 02/01/2006")

	text := fmt.Sprintf(
		"🤖 <b>[TỰ ĐỘNG] ĐÃ KHỚP LỆNH VIETQR (#%s)</b>\n\n"+
			"👤 <b>User ID:</b> <code>%d</code>\n"+
			"💵 <b>Số tiền:</b> <b>%s VNĐ</b> (~$%.2f USD)\n"+
			"⚡ <b>Trạng thái:</b> Đã tự động khớp qua thông báo MBBank & cộng Quota thành công!\n"+
			"⏰ <b>Thời gian:</b> %s",
		topUp.TradeNo,
		topUp.UserId,
		formatVND(int64(topUp.Money)),
		float64(topUp.Amount),
		timeStr,
	)

	reqBody := map[string]interface{}{
		"chat_id":    setting.TelegramAdminId,
		"text":       text,
		"parse_mode": "HTML",
	}

	payload, _ := common.Marshal(reqBody)
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", setting.TelegramBotToken)
	http.Post(url, "application/json", bytes.NewReader(payload))
}

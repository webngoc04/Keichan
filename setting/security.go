package setting

import (
	"os"
	"strconv"
	"sync"
)

var (
	SecurityAutoBanEnabled      = true
	SecurityIPMaxRPS            = 15 // Tối đa 15 requests / giây trên mỗi IP
	SecurityUserMaxRPS          = 10 // Tối đa 10 requests / giây trên mỗi User
	SecurityBanDurationMinutes  = 60 // Tự động khóa trong 60 phút

	securityMu sync.RWMutex
)

func init() {
	LoadSecurityEnv()
}

func LoadSecurityEnv() {
	securityMu.Lock()
	defer securityMu.Unlock()

	if v := os.Getenv("SECURITY_AUTO_BAN_ENABLED"); v != "" {
		SecurityAutoBanEnabled = v == "true" || v == "1"
	}
	if v := os.Getenv("SECURITY_IP_MAX_RPS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			SecurityIPMaxRPS = n
		}
	}
	if v := os.Getenv("SECURITY_USER_MAX_RPS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			SecurityUserMaxRPS = n
		}
	}
	if v := os.Getenv("SECURITY_BAN_DURATION_MINUTES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			SecurityBanDurationMinutes = n
		}
	}
}

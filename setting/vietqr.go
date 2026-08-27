package setting

import (
	"os"
	"strconv"
	"strings"
	"sync"
)

var (
	VietQREnabled         = true
	VietQRBankId          = "MB"
	VietQRAccountNo       = ""
	VietQRAccountName     = ""
	VietQRMinTopUp        = 1
	VietQRInfraFeeRatio   = 0.02 // +2% phí duy trì cơ sở hạ tầng
	VietQRWebhookSecret   = ""
	VietQRDefaultRate     = 25800.0
	VietQRRateCacheMinutes = 2
	VietQRBinanceP2PUrl   = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search"
	VietQRCoinGeckoUrl    = "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd,vnd"
	TelegramBotToken      = ""
	TelegramAdminId int64 = 0

	vietqrMu sync.RWMutex
)

func init() {
	LoadVietQREnv()
}

func LoadVietQREnv() {
	vietqrMu.Lock()
	defer vietqrMu.Unlock()

	if v := os.Getenv("VIETQR_ENABLED"); v != "" {
		VietQREnabled = v == "true" || v == "1"
	}
	if v := os.Getenv("VIETQR_BANK_ID"); v != "" {
		VietQRBankId = strings.TrimSpace(v)
	}
	if v := os.Getenv("VIETQR_ACCOUNT_NO"); v != "" {
		VietQRAccountNo = strings.TrimSpace(v)
	}
	if v := os.Getenv("VIETQR_ACCOUNT_NAME"); v != "" {
		VietQRAccountName = strings.TrimSpace(v)
	}
	if v := os.Getenv("VIETQR_MIN_TOPUP"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			VietQRMinTopUp = n
		}
	}
	if v := os.Getenv("VIETQR_INFRA_FEE_RATIO"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil && f >= 0 {
			VietQRInfraFeeRatio = f
		}
	}
	if v := os.Getenv("VIETQR_WEBHOOK_SECRET"); v != "" {
		VietQRWebhookSecret = strings.TrimSpace(v)
	}
	if v := os.Getenv("VIETQR_DEFAULT_RATE"); v != "" {
		if f, err := strconv.ParseFloat(v, 64); err == nil && f > 0 {
			VietQRDefaultRate = f
		}
	}
	if v := os.Getenv("VIETQR_RATE_CACHE_MINUTES"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 0 {
			VietQRRateCacheMinutes = n
		}
	}
	if v := os.Getenv("BINANCE_P2P_API_URL"); v != "" {
		VietQRBinanceP2PUrl = strings.TrimSpace(v)
	}
	if v := os.Getenv("COINGECKO_API_URL"); v != "" {
		VietQRCoinGeckoUrl = strings.TrimSpace(v)
	}
	if v := os.Getenv("TELEGRAM_BOT_TOKEN"); v != "" {
		TelegramBotToken = strings.TrimSpace(v)
	}
	if v := os.Getenv("TELEGRAM_ADMIN_ID"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil && id > 0 {
			TelegramAdminId = id
		}
	}
}

func SetVietQRConfig(enabled bool, bankId, accountNo, accountName string, minTopup int, feeRatio float64, botToken string, adminId int64) {
	vietqrMu.Lock()
	defer vietqrMu.Unlock()
	VietQREnabled = enabled
	if bankId != "" {
		VietQRBankId = bankId
	}
	if accountNo != "" {
		VietQRAccountNo = accountNo
	}
	VietQRAccountName = accountName
	if minTopup > 0 {
		VietQRMinTopUp = minTopup
	}
	if feeRatio >= 0 {
		VietQRInfraFeeRatio = feeRatio
	}
	if botToken != "" {
		TelegramBotToken = botToken
	}
	if adminId > 0 {
		TelegramAdminId = adminId
	}
}

func UpdateVietQROption(key string, value string) {
	vietqrMu.Lock()
	defer vietqrMu.Unlock()
	switch key {
	case "VietQREnabled":
		VietQREnabled = value == "true" || value == "1"
	case "VietQRBankId":
		if strings.TrimSpace(value) != "" {
			VietQRBankId = strings.TrimSpace(value)
		}
	case "VietQRAccountNo":
		if strings.TrimSpace(value) != "" {
			VietQRAccountNo = strings.TrimSpace(value)
		}
	case "VietQRAccountName":
		VietQRAccountName = strings.TrimSpace(value)
	case "VietQRMinTopUp":
		if v, err := strconv.Atoi(value); err == nil && v > 0 {
			VietQRMinTopUp = v
		}
	case "VietQRInfraFeeRatio":
		if v, err := strconv.ParseFloat(value, 64); err == nil && v >= 0 {
			VietQRInfraFeeRatio = v
		}
	case "VietQRWebhookSecret":
		if strings.TrimSpace(value) != "" {
			VietQRWebhookSecret = strings.TrimSpace(value)
		}
	case "TelegramBotToken":
		if strings.TrimSpace(value) != "" {
			TelegramBotToken = strings.TrimSpace(value)
		}
	case "TelegramAdminId":
		if v, err := strconv.ParseInt(value, 10, 64); err == nil && v > 0 {
			TelegramAdminId = v
		}
	}
}

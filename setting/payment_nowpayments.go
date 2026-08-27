package setting

// NOWPayments (https://nowpayments.io) crypto invoice configuration. Gateway
// is enabled once ApiKey + IpnSecret are populated (no separate Enabled flag,
// matching Stripe / Creem). UnitPrice is USD charged per 1 USD of top-up
// amount.
var (
	NowpaymentsApiUrl     string  = "https://api.nowpayments.io"
	NowpaymentsApiKey     string
	NowpaymentsIpnSecret  string
	NowpaymentsPayCurrency string
	NowpaymentsUnitPrice  float64 = 1.0
	NowpaymentsMinTopUp   int     = 1
)

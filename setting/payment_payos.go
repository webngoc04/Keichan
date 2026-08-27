package setting

// PayOS (https://payos.vn) hosted checkout configuration. Gateway is enabled
// once ClientId + ApiKey + ChecksumKey are populated (no separate Enabled
// flag, matching Stripe / Creem). UnitPrice is VND charged per 1 USD of
// top-up amount.
var (
	PayosClientId    string
	PayosApiKey      string
	PayosChecksumKey string
	PayosReturnURL   string
	PayosCancelURL   string
	PayosUnitPrice   float64 = 26000
	PayosMinTopUp    int     = 1
)

package controller

import (
	"crypto/hmac"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"time"

	"encoding/json"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"github.com/thanhpk/randstr"
)

type NowpaymentsPayRequest struct {
	Amount int64 `json:"amount"`
}

func isNowpaymentsConfigured() bool {
	return strings.TrimSpace(setting.NowpaymentsApiKey) != "" &&
		strings.TrimSpace(setting.NowpaymentsIpnSecret) != ""
}

// getNowpaymentsPayMoney returns the USD amount charged for `amount` units.
func getNowpaymentsPayMoney(amount int64, group string) float64 {
	dAmount := decimal.NewFromInt(amount)
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		dAmount = dAmount.Div(decimal.NewFromFloat(common.QuotaPerUnit))
	}

	topupGroupRatio := common.GetTopupGroupRatio(group)
	if topupGroupRatio == 0 {
		topupGroupRatio = 1
	}

	discount := 1.0
	if ds, ok := operation_setting.GetPaymentSetting().AmountDiscount[int(amount)]; ok && ds > 0 {
		discount = ds
	}

	payMoney := dAmount.
		Mul(decimal.NewFromFloat(setting.NowpaymentsUnitPrice)).
		Mul(decimal.NewFromFloat(topupGroupRatio)).
		Mul(decimal.NewFromFloat(discount))

	return payMoney.InexactFloat64()
}

func normalizeNowpaymentsTopUpAmount(amount int64) int64 {
	if operation_setting.GetQuotaDisplayType() != operation_setting.QuotaDisplayTypeTokens {
		return amount
	}

	normalized := decimal.NewFromInt(amount).
		Div(decimal.NewFromFloat(common.QuotaPerUnit)).
		IntPart()
	if normalized < 1 {
		return 1
	}
	return normalized
}

func RequestNowpaymentsAmount(c *gin.Context) {
	var req NowpaymentsPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	if req.Amount < int64(setting.NowpaymentsMinTopUp) {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", setting.NowpaymentsMinTopUp)})
		return
	}
	id := c.GetInt("id")
	if rejectInvalidTopUpQuota(c, id, req.Amount) {
		return
	}

	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	payMoney := getNowpaymentsPayMoney(req.Amount, group)
	if payMoney <= 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success", "data": fmt.Sprintf("%.2f", payMoney)})
}

type nowpaymentsInvoiceResponse struct {
	InvoiceURL string `json:"invoice_url"`
	Message    string `json:"message"`
}

func nowpaymentsOrigin(c *gin.Context) string {
	proto := c.GetHeader("X-Forwarded-Proto")
	if proto == "" {
		if c.Request.TLS != nil {
			proto = "https"
		} else {
			proto = "http"
		}
	}
	host := c.Request.Host
	if host == "" {
		return ""
	}
	return proto + "://" + host
}

func genNowpaymentsInvoice(orderId string, priceUsd float64, ipnCallbackUrl string, successUrl string, cancelUrl string) (string, error) {
	reqBody := map[string]interface{}{
		"price_amount":     priceUsd,
		"price_currency":   "usd",
		"order_id":         orderId,
		"ipn_callback_url": ipnCallbackUrl,
		"success_url":      successUrl,
		"cancel_url":       cancelUrl,
	}
	if payCurrency := strings.TrimSpace(setting.NowpaymentsPayCurrency); payCurrency != "" {
		reqBody["pay_currency"] = payCurrency
	}

	payload, err := common.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	apiBase := strings.TrimRight(strings.TrimSpace(setting.NowpaymentsApiUrl), "/")
	if apiBase == "" {
		apiBase = "https://api.nowpayments.io"
	}

	req, err := http.NewRequest(http.MethodPost, apiBase+"/v1/invoice", strings.NewReader(string(payload)))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", setting.NowpaymentsApiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var result nowpaymentsInvoiceResponse
	if err := common.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("nowpayments invalid response: %s", string(body))
	}
	if result.InvoiceURL == "" {
		return "", fmt.Errorf("nowpayments error message=%s body=%s", result.Message, string(body))
	}
	return result.InvoiceURL, nil
}

// canonicalizeNowpaymentsJson rebuilds the payload as compact JSON with
// top-level keys sorted alphabetically and raw value bytes preserved —
// exactly what NOWPayments' IPN signing algorithm expects.
func canonicalizeNowpaymentsJson(body []byte) (string, map[string]json.RawMessage, error) {
	var fields map[string]json.RawMessage
	if err := common.Unmarshal(body, &fields); err != nil {
		return "", nil, err
	}
	keys := make([]string, 0, len(fields))
	for k := range fields {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var sb strings.Builder
	sb.WriteByte('{')
	for i, k := range keys {
		if i > 0 {
			sb.WriteByte(',')
		}
		keyBytes, _ := common.Marshal(k)
		sb.Write(keyBytes)
		sb.WriteByte(':')
		sb.Write(fields[k])
	}
	sb.WriteByte('}')
	return sb.String(), fields, nil
}

func verifyNowpaymentsSignature(canonicalJson string, signature string) bool {
	mac := hmac.New(sha512.New, []byte(setting.NowpaymentsIpnSecret))
	mac.Write([]byte(canonicalJson))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

func RequestNowpaymentsPay(c *gin.Context) {
	if !isNowpaymentsTopUpEnabled() {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "NOWPayments 配置不完整"})
		return
	}

	var req NowpaymentsPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}
	if req.Amount < int64(setting.NowpaymentsMinTopUp) {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", setting.NowpaymentsMinTopUp)})
		return
	}
	id := c.GetInt("id")
	if rejectInvalidTopUpQuota(c, id, req.Amount) {
		return
	}

	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	payMoney := getNowpaymentsPayMoney(req.Amount, group)
	if payMoney < 0.01 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	normalizedAmount := normalizeNowpaymentsTopUpAmount(req.Amount)
	now := time.Now().Unix()

	// 5-second anti-duplicate protection:
	// If the user submits within 5 seconds for the same amount with an active pending order,
	// reuse the existing order to prevent duplicate dangling records.
	var existingTopUp model.TopUp
	err = model.DB.Where(
		"user_id = ? AND amount = ? AND payment_provider = ? AND status = ? AND create_time >= ?",
		id, normalizedAmount, model.PaymentProviderNowpayments, common.TopUpStatusPending, now-5,
	).Order("id desc").First(&existingTopUp).Error

	origin := nowpaymentsOrigin(c)
	ipnCallbackUrl := origin + "/api/nowpayments/webhook"
	successUrl := origin + "/wallet"
	cancelUrl := origin + "/wallet"

	if err == nil && existingTopUp.TradeNo != "" {
		invoiceUrl, err := genNowpaymentsInvoice(existingTopUp.TradeNo, existingTopUp.Money, ipnCallbackUrl, successUrl, cancelUrl)
		if err == nil && invoiceUrl != "" {
			c.JSON(http.StatusOK, gin.H{
				"message": "success",
				"data": gin.H{
					"checkout_url": invoiceUrl,
					"order_id":     existingTopUp.TradeNo,
				},
			})
			return
		}
	}

	// If more than 5 seconds, auto-expire any previous stale pending orders of this user
	model.DB.Model(&model.TopUp{}).
		Where("user_id = ? AND payment_provider = ? AND status = ? AND create_time < ?",
			id, model.PaymentProviderNowpayments, common.TopUpStatusPending, now-5).
		Updates(map[string]interface{}{
			"status": common.TopUpStatusExpired,
		})

	tradeNo := fmt.Sprintf("NP-%d-%d-%s", id, time.Now().UnixMilli(), randstr.String(6))
	topUp := &model.TopUp{
		UserId:          id,
		Amount:          normalizedAmount,
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   model.PaymentMethodNowpayments,
		PaymentProvider: model.PaymentProviderNowpayments,
		CreateTime:      now,
		Status:          common.TopUpStatusPending,
	}
	if err := topUp.Insert(); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments 创建充值订单失败 user_id=%d trade_no=%s amount=%d error=%q", id, tradeNo, req.Amount, err.Error()))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}

	invoiceUrl, err := genNowpaymentsInvoice(tradeNo, payMoney, ipnCallbackUrl, successUrl, cancelUrl)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments 创建发票失败 user_id=%d trade_no=%s error=%q", id, tradeNo, err.Error()))
		topUp.Status = common.TopUpStatusFailed
		_ = topUp.Update()
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "拉起支付失败"})
		return
	}
	logger.LogInfo(c.Request.Context(), fmt.Sprintf("NOWPayments 充值订单创建成功 user_id=%d trade_no=%s money=%.2f", id, tradeNo, payMoney))

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data": gin.H{
			"checkout_url": invoiceUrl,
			"order_id":     tradeNo,
		},
	})
}

type nowpaymentsIpnPayload struct {
	PaymentId     json.Number `json:"payment_id"`
	PaymentStatus string      `json:"payment_status"`
	OrderId       string      `json:"order_id"`
	ActuallyPaid  json.Number `json:"actually_paid"`
}

func NowpaymentsWebhook(c *gin.Context) {
	if !isNowpaymentsWebhookEnabled() {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 被拒绝 reason=webhook_disabled path=%q client_ip=%s", c.Request.RequestURI, c.ClientIP()))
		c.String(http.StatusForbidden, "webhook disabled")
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 读取请求体失败 path=%q client_ip=%s error=%q", c.Request.RequestURI, c.ClientIP(), err.Error()))
		c.String(http.StatusBadRequest, "bad request")
		return
	}

	signature := c.GetHeader("X-Nowpayments-Sig")
	canonical, _, err := canonicalizeNowpaymentsJson(bodyBytes)
	if err != nil {
		c.String(http.StatusBadRequest, "bad request")
		return
	}

	if !verifyNowpaymentsSignature(canonical, signature) {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 验签失败 path=%q client_ip=%s body=%q", c.Request.RequestURI, c.ClientIP(), string(bodyBytes)))
		c.String(http.StatusUnauthorized, "invalid signature")
		return
	}

	var payload nowpaymentsIpnPayload
	if err := common.Unmarshal(bodyBytes, &payload); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 解析失败 client_ip=%s body=%q", c.ClientIP(), string(bodyBytes)))
		c.String(http.StatusOK, "OK")
		return
	}

	tradeNo := strings.TrimSpace(payload.OrderId)
	if tradeNo == "" {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 缺少 order_id client_ip=%s body=%q", c.ClientIP(), string(bodyBytes)))
		c.String(http.StatusOK, "OK")
		return
	}

	if payload.PaymentStatus != "finished" {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 状态更新 status=%s payment_id=%s trade_no=%s client_ip=%s", payload.PaymentStatus, payload.PaymentId.String(), tradeNo, c.ClientIP()))
		c.String(http.StatusOK, "OK")
		return
	}

	topUp := model.GetTopUpByTradeNo(tradeNo)
	if topUp == nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments webhook 订单不存在 trade_no=%s client_ip=%s", tradeNo, c.ClientIP()))
		c.String(http.StatusOK, "OK")
		return
	}

	LockOrder(tradeNo)
	defer UnlockOrder(tradeNo)

	actualAmount, _ := payload.ActuallyPaid.Float64()
	if err := model.RechargeNowpayments(tradeNo, actualAmount, c.ClientIP()); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("NOWPayments 充值处理失败 trade_no=%s client_ip=%s error=%q", tradeNo, c.ClientIP(), err.Error()))
		c.String(http.StatusInternalServerError, "retry")
		return
	}

	logger.LogInfo(c.Request.Context(), fmt.Sprintf("NOWPayments 充值成功 trade_no=%s payment_id=%s actually_paid=%s client_ip=%s", tradeNo, payload.PaymentId.String(), payload.ActuallyPaid.String(), c.ClientIP()))
	c.String(http.StatusOK, "OK")
}

// CheckNowpaymentsStatus checks payment status of a NOWPayments order with 2-minute auto-expiration
func CheckNowpaymentsStatus(c *gin.Context) {
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

	// Auto-expire pending order if exceeded 2 minutes (120 seconds) to prevent hanging
	if topUp.Status == common.TopUpStatusPending && common.GetTimestamp()-topUp.CreateTime > 120 {
		_ = model.UpdatePendingTopUpStatus(tradeNo, model.PaymentProviderNowpayments, common.TopUpStatusExpired)
		topUp.Status = common.TopUpStatusExpired
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

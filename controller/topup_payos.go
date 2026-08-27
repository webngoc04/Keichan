package controller

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"

	"encoding/json"
)

const payosApiBase = "https://api-merchant.payos.vn"

type PayosPayRequest struct {
	Amount int64 `json:"amount"`
}

func isPayosConfigured() bool {
	return strings.TrimSpace(setting.PayosClientId) != "" &&
		strings.TrimSpace(setting.PayosApiKey) != "" &&
		strings.TrimSpace(setting.PayosChecksumKey) != ""
}

// getPayosPayMoney returns the VND amount charged for `amount` units.
func getPayosPayMoney(amount int64, group string) float64 {
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
		Mul(decimal.NewFromFloat(setting.PayosUnitPrice)).
		Mul(decimal.NewFromFloat(topupGroupRatio)).
		Mul(decimal.NewFromFloat(discount))

	return payMoney.InexactFloat64()
}

func normalizePayosTopUpAmount(amount int64) int64 {
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

func payosSiteOrigin(c *gin.Context) string {
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
		return "/wallet"
	}
	return proto + "://" + host + "/wallet"
}

// signPayosPaymentRequest implements the documented create-payment-link
// signature: HMAC_SHA256(checksumKey, sorted "k=v&..." of the five fields).
func signPayosPaymentRequest(amount string, cancelUrl string, description string, orderCode string, returnUrl string) string {
	payload := fmt.Sprintf("amount=%s&cancelUrl=%s&description=%s&orderCode=%s&returnUrl=%s",
		amount, cancelUrl, description, orderCode, returnUrl)
	mac := hmac.New(sha256.New, []byte(setting.PayosChecksumKey))
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}

// verifyPayosWebhookSignature sorts the webhook `data` keys alphabetically,
// concatenates raw JSON values as "k=v&...", and compares HMAC_SHA256 hex.
func verifyPayosWebhookSignature(data map[string]json.RawMessage, signature string) bool {
	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		raw := strings.TrimSpace(string(data[k]))
		if raw == "" || raw == "null" {
			continue
		}
		var strVal string
		if err := common.Unmarshal(data[k], &strVal); err == nil {
			parts = append(parts, k+"="+strVal)
			continue
		}
		var numVal json.Number
		if err := common.Unmarshal(data[k], &numVal); err == nil {
			parts = append(parts, k+"="+numVal.String())
			continue
		}
		var boolVal bool
		if err := common.Unmarshal(data[k], &boolVal); err == nil {
			parts = append(parts, k+"="+strconv.FormatBool(boolVal))
		}
	}

	mac := hmac.New(sha256.New, []byte(setting.PayosChecksumKey))
	mac.Write([]byte(strings.Join(parts, "&")))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}

func RequestPayosAmount(c *gin.Context) {
	var req PayosPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	if req.Amount < int64(setting.PayosMinTopUp) {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", setting.PayosMinTopUp)})
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

	payMoney := getPayosPayMoney(req.Amount, group)
	if payMoney <= 10000 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success", "data": fmt.Sprintf("%.0f", payMoney)})
}

type payosCreateLinkResponse struct {
	Code string `json:"code"`
	Desc string `json:"desc"`
	Data struct {
		CheckoutUrl string `json:"checkoutUrl"`
	} `json:"data"`
	Error *string `json:"error"`
}

func genPayosLink(orderCode int64, amountVnd int64, description string, returnUrl string, cancelUrl string) (string, error) {
	signature := signPayosPaymentRequest(
		strconv.FormatInt(amountVnd, 10),
		cancelUrl,
		description,
		strconv.FormatInt(orderCode, 10),
		returnUrl,
	)
	reqBody, err := common.Marshal(map[string]interface{}{
		"orderCode":   orderCode,
		"amount":      amountVnd,
		"description": description,
		"returnUrl":   returnUrl,
		"cancelUrl":   cancelUrl,
		"signature":   signature,
	})
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest(http.MethodPost, payosApiBase+"/v2/payment-requests", strings.NewReader(string(reqBody)))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-client-id", setting.PayosClientId)
	req.Header.Set("x-api-key", setting.PayosApiKey)

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

	var result payosCreateLinkResponse
	if err := common.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("payos invalid response: %s", string(body))
	}
	if result.Code != "00" || result.Data.CheckoutUrl == "" {
		return "", fmt.Errorf("payos error code=%s desc=%s", result.Code, result.Desc)
	}
	return result.Data.CheckoutUrl, nil
}

func RequestPayosPay(c *gin.Context) {
	if !isPayosTopUpEnabled() {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "PayOS 配置不完整"})
		return
	}

	var req PayosPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "参数错误"})
		return
	}
	if req.Amount < int64(setting.PayosMinTopUp) {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": fmt.Sprintf("充值数量不能小于 %d", setting.PayosMinTopUp)})
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

	payMoney := getPayosPayMoney(req.Amount, group)
	amountVnd := int64(payMoney + 0.5)
	if amountVnd < 10000 {
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "充值金额过低，至少 10,000 VND"})
		return
	}

	orderCode := time.Now().UnixMilli()*1000 + time.Now().UnixNano()%1000
	tradeNo := fmt.Sprintf("PAYOS-%d", orderCode)

	topUp := &model.TopUp{
		UserId:          id,
		Amount:          normalizePayosTopUpAmount(req.Amount),
		Money:           payMoney,
		TradeNo:         tradeNo,
		PaymentMethod:   model.PaymentMethodPayos,
		PaymentProvider: model.PaymentProviderPayos,
		CreateTime:      time.Now().Unix(),
		Status:          common.TopUpStatusPending,
	}
	if err := topUp.Insert(); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS 创建充值订单失败 user_id=%d trade_no=%s amount=%d error=%q", id, tradeNo, req.Amount, err.Error()))
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}

	description := "Topup quota"
	returnUrl := strings.TrimSpace(setting.PayosReturnURL)
	if returnUrl == "" {
		returnUrl = payosSiteOrigin(c)
	}
	cancelUrl := strings.TrimSpace(setting.PayosCancelURL)
	if cancelUrl == "" {
		cancelUrl = payosSiteOrigin(c)
	}

	checkoutUrl, err := genPayosLink(orderCode, amountVnd, description, returnUrl, cancelUrl)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS 创建支付链接失败 user_id=%d trade_no=%s error=%q", id, tradeNo, err.Error()))
		topUp.Status = common.TopUpStatusFailed
		_ = topUp.Update()
		c.JSON(http.StatusOK, gin.H{"message": "error", "data": "拉起支付失败"})
		return
	}
	logger.LogInfo(c.Request.Context(), fmt.Sprintf("PayOS 充值订单创建成功 user_id=%d trade_no=%s order_code=%d amount=%d money=%.2f", id, tradeNo, orderCode, amountVnd, payMoney))

	c.JSON(http.StatusOK, gin.H{
		"message": "success",
		"data": gin.H{
			"checkout_url": checkoutUrl,
			"order_id":     tradeNo,
		},
	})
}

type payosWebhookPayload struct {
	Code      string                     `json:"code"`
	Desc      string                     `json:"desc"`
	Success   *bool                      `json:"success"`
	Data      map[string]json.RawMessage `json:"data"`
	Signature string                     `json:"signature"`
}

func PayosWebhook(c *gin.Context) {
	if !isPayosWebhookEnabled() {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("PayOS webhook 被拒绝 reason=webhook_disabled path=%q client_ip=%s", c.Request.RequestURI, c.ClientIP()))
		c.String(http.StatusForbidden, "webhook disabled")
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS webhook 读取请求体失败 path=%q client_ip=%s error=%q", c.Request.RequestURI, c.ClientIP(), err.Error()))
		c.String(http.StatusBadRequest, "bad request")
		return
	}

	var payload payosWebhookPayload
	if err := common.Unmarshal(bodyBytes, &payload); err != nil {
		c.String(http.StatusBadRequest, "bad request")
		return
	}

	if !verifyPayosWebhookSignature(payload.Data, payload.Signature) {
		logger.LogWarn(c.Request.Context(), fmt.Sprintf("PayOS webhook 验签失败 path=%q client_ip=%s body=%q", c.Request.RequestURI, c.ClientIP(), string(bodyBytes)))
		c.String(http.StatusUnauthorized, "invalid signature")
		return
	}

	if payload.Code != "00" || payload.Success == nil || !*payload.Success {
		logger.LogInfo(c.Request.Context(), fmt.Sprintf("PayOS webhook 非成功事件 code=%s desc=%s client_ip=%s", payload.Code, payload.Desc, c.ClientIP()))
		c.String(http.StatusOK, "OK")
		return
	}

	var orderCodeStr string
	if err := common.Unmarshal(payload.Data["orderCode"], &orderCodeStr); err != nil {
		var orderCodeNum json.Number
		if err := common.Unmarshal(payload.Data["orderCode"], &orderCodeNum); err != nil {
			logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS webhook 缺少 orderCode client_ip=%s body=%q", c.ClientIP(), string(bodyBytes)))
			c.String(http.StatusOK, "OK")
			return
		}
		orderCodeStr = orderCodeNum.String()
	}

	tradeNo := "PAYOS-" + orderCodeStr
	topUp := model.GetTopUpByTradeNo(tradeNo)
	if topUp == nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS webhook 订单不存在 order_code=%s trade_no=%s client_ip=%s", orderCodeStr, tradeNo, c.ClientIP()))
		c.String(http.StatusOK, "OK")
		return
	}

	LockOrder(tradeNo)
	defer UnlockOrder(tradeNo)

	if err := model.RechargePayos(tradeNo, c.ClientIP()); err != nil {
		logger.LogError(c.Request.Context(), fmt.Sprintf("PayOS 充值处理失败 trade_no=%s order_code=%s client_ip=%s error=%q", tradeNo, orderCodeStr, c.ClientIP(), err.Error()))
		c.String(http.StatusInternalServerError, "retry")
		return
	}

	logger.LogInfo(c.Request.Context(), fmt.Sprintf("PayOS 充值成功 trade_no=%s order_code=%s client_ip=%s", tradeNo, orderCodeStr, c.ClientIP()))
	c.String(http.StatusOK, "OK")
}

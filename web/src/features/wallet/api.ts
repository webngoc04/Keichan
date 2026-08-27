/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { api } from '@/lib/api'

import type {
  RedemptionRequest,
  PaymentRequest,
  AmountRequest,
  AffiliateTransferRequest,
  ApiResponse,
  TopupInfoResponse,
  RedemptionResponse,
  AmountResponse,
  PaymentResponse,
  StripePaymentResponse,
  AffiliateCodeResponse,
  AffiliateTransferResponse,
  BillingHistoryResponse,
  CompleteOrderRequest,
  CreemPaymentRequest,
  CreemPaymentResponse,
  WaffoPaymentRequest,
  WaffoPaymentResponse,
  WaffoPancakePaymentRequest,
  WaffoPancakePaymentResponse,
  PayosPaymentResponse,
  NowpaymentsPaymentResponse,
  VietQRTopUpResponse,
} from './types'

// ============================================================================
// Wallet API Functions
// ============================================================================

/**
 * Check if API response is successful
 */
export function isApiSuccess(response: ApiResponse): boolean {
  return response.success === true || response.message === 'success'
}

/**
 * Get topup configuration info
 */
export async function getTopupInfo(): Promise<TopupInfoResponse> {
  const res = await api.get('/api/user/topup/info')
  return res.data
}

/**
 * Redeem a topup code
 */
export async function redeemTopupCode(
  request: RedemptionRequest
): Promise<RedemptionResponse> {
  const res = await api.post('/api/user/topup', request)
  return res.data
}

/**
 * Calculate payment amount for regular payment
 */
export async function calculateAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate payment amount for Stripe payment
 */
export async function calculateStripeAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/stripe/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate payment amount for Waffo payment
 */
export async function calculateWaffoAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/waffo/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request regular payment
 */
export async function requestPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const res = await api.post('/api/user/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return {
    ...res.data,
    url: res.data.url || (res as unknown as { url?: string }).url,
  }
}

/**
 * Request Stripe payment
 */
export async function requestStripePayment(
  request: PaymentRequest
): Promise<StripePaymentResponse> {
  const res = await api.post('/api/user/stripe/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request Creem payment
 */
export async function requestCreemPayment(
  request: CreemPaymentRequest
): Promise<CreemPaymentResponse> {
  const res = await api.post('/api/user/creem/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request Waffo payment
 */
export async function requestWaffoPayment(
  request: WaffoPaymentRequest
): Promise<WaffoPaymentResponse> {
  const res = await api.post('/api/user/waffo/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate payment amount for Waffo Pancake payment
 */
export async function calculateWaffoPancakeAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/waffo-pancake/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request Waffo Pancake payment
 */
export async function requestWaffoPancakePayment(
  request: WaffoPancakePaymentRequest
): Promise<WaffoPancakePaymentResponse> {
  const res = await api.post('/api/user/waffo-pancake/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate payment amount for PayOS payment
 */
export async function calculatePayosAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/payos/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request PayOS payment (VN bank QR hosted checkout)
 */
export async function requestPayosPayment(
  request: WaffoPancakePaymentRequest
): Promise<PayosPaymentResponse> {
  const res = await api.post('/api/user/payos/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate payment amount for NOWPayments crypto payment
 */
export async function calculateNowpaymentsAmount(
  request: AmountRequest
): Promise<AmountResponse> {
  const res = await api.post('/api/user/nowpayments/amount', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request NOWPayments crypto payment (hosted invoice checkout)
 */
export async function requestNowpaymentsPayment(
  request: WaffoPancakePaymentRequest
): Promise<NowpaymentsPaymentResponse> {
  const res = await api.post('/api/user/nowpayments/pay', request, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Calculate amount for VietQR payment
 */
export async function calculateVietQRAmount(
  amount: number
): Promise<ApiResponse<{ usd: number; vnd: number; rate: number; fee_ratio: number; bank_id: string; account_no: string }>> {
  const res = await api.post('/api/user/vietqr/amount', { amount }, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Request VietQR payment (returns dynamic VietQR code, bank info, memo)
 */
export async function requestVietQRPayment(
  amount: number
): Promise<VietQRTopUpResponse> {
  const res = await api.post('/api/user/vietqr/pay', { amount }, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Check VietQR payment status
 */
export async function checkVietQRStatus(
  tradeNo: string
): Promise<ApiResponse<{ trade_no: string; status: string; amount: number; money: number; complete_time: number }>> {
  const res = await api.get(`/api/user/vietqr/status?trade_no=${encodeURIComponent(tradeNo)}`, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Check NOWPayments payment status
 */
export async function checkNowpaymentsStatus(
  tradeNo: string
): Promise<ApiResponse<{ trade_no: string; status: string; amount: number; money: number; complete_time: number }>> {
  const res = await api.get(`/api/user/nowpayments/status?trade_no=${encodeURIComponent(tradeNo)}`, {
    skipBusinessError: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Get affiliate code
 */
export async function getAffiliateCode(): Promise<AffiliateCodeResponse> {
  const res = await api.get('/api/user/aff')
  return res.data
}

/**
 * Transfer affiliate quota to balance
 */
export async function transferAffiliateQuota(
  request: AffiliateTransferRequest
): Promise<AffiliateTransferResponse> {
  const res = await api.post('/api/user/aff_transfer', request)
  return res.data
}

/**
 * Get billing history for current user
 */
export async function getUserBillingHistory(
  page: number,
  pageSize: number,
  keyword?: string
): Promise<ApiResponse<BillingHistoryResponse>> {
  const params = new URLSearchParams({
    p: page.toString(),
    page_size: pageSize.toString(),
  })
  if (keyword) {
    params.append('keyword', keyword)
  }
  const res = await api.get(`/api/user/topup/self?${params.toString()}`)
  return res.data
}

/**
 * Get billing history for all users (admin only)
 */
export async function getAllBillingHistory(
  page: number,
  pageSize: number,
  keyword?: string
): Promise<ApiResponse<BillingHistoryResponse>> {
  const params = new URLSearchParams({
    p: page.toString(),
    page_size: pageSize.toString(),
  })
  if (keyword) {
    params.append('keyword', keyword)
  }
  const res = await api.get(`/api/user/topup?${params.toString()}`)
  return res.data
}

/**
 * Complete a pending order (admin only)
 */
export async function completeOrder(
  request: CompleteOrderRequest
): Promise<ApiResponse> {
  const res = await api.post('/api/user/topup/complete', request)
  return res.data
}

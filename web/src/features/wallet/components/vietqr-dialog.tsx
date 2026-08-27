import { Check, Copy, Loader2, QrCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { checkVietQRStatus } from '../api'
import type { VietQRTopUpData } from '../types'

interface VietQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: VietQRTopUpData | null
  onSuccess: () => void
}

export function VietQRDialog({
  open,
  onOpenChange,
  order,
  onSuccess,
}: VietQRDialogProps) {
  const { t } = useTranslation()
  const [isCopiedStk, setIsCopiedStk] = useState(false)
  const [isCopiedMoney, setIsCopiedMoney] = useState(false)
  const [isCopiedMemo, setIsCopiedMemo] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)

  // 2-minute countdown timer
  useEffect(() => {
    if (!open || isSuccess) return
    setTimeLeft(120)

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          toast.error(t('Order expired after 2 minutes. Please create a new order.'))
          onOpenChange(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, isSuccess, onOpenChange, t])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  // Reset state when opening new order
  useEffect(() => {
    if (open) {
      setIsSuccess(false)
      setImageLoaded(false)
    }
  }, [open, order?.trade_no])

  // Real-time polling for order completion with visibility change & focus auto-resume
  useEffect(() => {
    if (!open || !order?.trade_no || isSuccess) return

    let isMounted = true
    let closeTimer: ReturnType<typeof setTimeout> | undefined

    const checkStatus = async () => {
      if (!isMounted || !order?.trade_no) return
      try {
        const res = await checkVietQRStatus(order.trade_no)
        if (!isMounted) return

        const status = res.data?.status
        if (status === 'expired' || status === 'failed') {
          toast.error(t('Order expired after 2 minutes. Please create a new order.'))
          onOpenChange(false)
          return
        }

        const isCompleted =
          res.success &&
          (status === 'success' ||
            status === '1' ||
            (res.data?.complete_time && res.data.complete_time > 0))

        if (isCompleted) {
          setIsSuccess(true)
          toast.success(t('Payment successful! Quota added to your balance.'))
          onSuccess()
          // Automatically close the bank popup after 1.2 seconds so user sees confirmation
          closeTimer = setTimeout(() => {
            if (isMounted) {
              onOpenChange(false)
            }
          }, 1200)
        }
      } catch {
        // Ignore polling network errors
      }
    }

    // 1. Initial check
    checkStatus()

    // 2. Periodic polling interval
    const interval = setInterval(checkStatus, 2000)

    // 3. Instant check when user switches back from Banking app (MoMo, MBBank, Vietcombank, etc.)
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkStatus()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)

    return () => {
      isMounted = false
      clearInterval(interval)
      if (closeTimer) clearTimeout(closeTimer)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
    }
  }, [open, order?.trade_no, isSuccess, onSuccess, onOpenChange, t])

  const copyToClipboard = async (
    text: string,
    setCopied: (v: boolean) => void,
    label: string
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} ${t('copied to clipboard')}`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('Failed to copy'))
    }
  }

  if (!order) return null

  const formattedVnd = new Intl.NumberFormat('vi-VN').format(order.amount_vnd)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[460px] p-6 sm:p-7'>
        <DialogHeader className='space-y-2'>
          <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl font-bold'>
            <QrCode className='size-5 text-primary' />
            <span>{t('VietQR Bank Transfer')}</span>
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
            {t(
              'Scan QR code with any banking app (MBBank, Vietcombank, Techcombank, MoMo, Cake...) to pay automatically.'
            )}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className='py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300'>
            <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'>
              <Check className='size-8 stroke-[2.5]' />
            </div>
            <div className='space-y-1.5'>
              <h3 className='text-lg font-bold text-foreground'>
                {t('Payment Received Successfully!')}
              </h3>
              <p className='text-xs text-muted-foreground max-w-xs mx-auto'>
                {t('Quota')} +${order.amount_usd} USD {t('has been credited to your account.')}
              </p>
            </div>
            <Button
              className='mt-2 rounded-full px-6'
              onClick={() => onOpenChange(false)}
            >
              {t('Done')}
            </Button>
          </div>
        ) : (
          <div className='space-y-5 pt-1'>
            {/* QR Code Container */}
            <div className='relative mx-auto flex max-w-[240px] flex-col items-center justify-center rounded-2xl border-2 border-border/80 bg-white p-3 shadow-md'>
              {!imageLoaded && (
                <div className='absolute inset-0 flex items-center justify-center bg-muted/40 rounded-2xl'>
                  <Loader2 className='size-8 animate-spin text-primary' />
                </div>
              )}
              <img
                src={order.qr_url}
                alt='VietQR Code'
                className='size-full rounded-xl object-contain'
                onLoad={() => setImageLoaded(true)}
              />
              <div className='mt-1 text-[10px] font-mono text-zinc-600 font-semibold uppercase tracking-wider'>
                VietQR • NAPAS 247
              </div>
            </div>

            {/* Transfer Details Card */}
            <div className='rounded-2xl border border-border/70 bg-muted/40 p-4 space-y-3 font-mono text-xs'>
              <div className='flex items-center justify-between gap-2'>
                <span className='text-muted-foreground font-sans'>{t('Bank')}:</span>
                <span className='font-bold text-foreground font-sans'>{order.bank_name}</span>
              </div>

              <div className='flex items-center justify-between gap-2'>
                <span className='text-muted-foreground font-sans'>{t('Account Number')}:</span>
                <div className='flex items-center gap-1.5'>
                  <span className='font-bold text-foreground select-all'>{order.account_no}</span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-6 rounded-md hover:bg-muted'
                    onClick={() => copyToClipboard(order.account_no, setIsCopiedStk, t('Account Number'))}
                  >
                    {isCopiedStk ? <Check className='size-3 text-emerald-500' /> : <Copy className='size-3 text-muted-foreground' />}
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between gap-2 border-t border-border/40 pt-2.5'>
                <span className='text-muted-foreground font-sans'>{t('Amount')}:</span>
                <div className='flex items-center gap-1.5'>
                  <span className='font-bold text-emerald-500 text-sm select-all'>
                    {formattedVnd} VNĐ
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-6 rounded-md hover:bg-muted'
                    onClick={() => copyToClipboard(order.amount_vnd.toString(), setIsCopiedMoney, t('Amount'))}
                  >
                    {isCopiedMoney ? <Check className='size-3 text-emerald-500' /> : <Copy className='size-3 text-muted-foreground' />}
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between gap-2 border-t border-border/40 pt-2.5 bg-primary/5 -mx-4 -mb-4 p-4 rounded-b-2xl border-t-primary/20'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground font-sans font-medium'>{t('Transfer Memo')}:</span>
                  <span className='text-[10px] text-muted-foreground font-sans'>({t('Keep exact memo')})</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='font-bold text-primary text-sm px-2 py-0.5 rounded bg-primary/10 select-all'>
                    {order.memo}
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-7 rounded-md hover:bg-primary/20'
                    onClick={() => copyToClipboard(order.memo, setIsCopiedMemo, t('Transfer Memo'))}
                  >
                    {isCopiedMemo ? <Check className='size-3.5 text-emerald-500' /> : <Copy className='size-3.5 text-primary' />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Polling Status Indicator & 2-Minute Expiration Countdown */}
            <div className='flex items-center justify-between px-1 text-xs text-muted-foreground font-medium'>
              <div className='flex items-center gap-2'>
                <span className='relative flex size-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex size-2 rounded-full bg-emerald-500'></span>
                </span>
                <span>{t('Waiting for transfer...')}</span>
              </div>
              <span className='font-mono font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[11px]'>
                ⏳ {formatCountdown(timeLeft)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className='pt-2 sm:pt-0'>
          <Button
            variant='outline'
            className='w-full rounded-full text-xs font-mono'
            onClick={() => onOpenChange(false)}
          >
            {t('Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

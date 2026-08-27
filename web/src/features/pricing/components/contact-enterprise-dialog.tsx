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
import { Clock, Info, Mail, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useStatus } from '@/hooks/use-status'

interface ContactEnterpriseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactEnterpriseDialog({
  open,
  onOpenChange,
}: ContactEnterpriseDialogProps) {
  const { t } = useTranslation()
  const { status } = useStatus()

  const systemName = (status?.system_name as string) || 'NewAPI'
  const email = (status?.email as string) || ''
  const telegram = (status?.telegram_contact as string) || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <div className='bg-amber-500/10 text-amber-400 mb-2 flex size-10 items-center justify-center rounded-xl border border-amber-500/30'>
            <Clock className='size-5' />
          </div>
          <DialogTitle className='text-xl font-bold'>
            {t('Enterprise & Queue Cluster (In Development)')}
          </DialogTitle>
          <DialogDescription className='text-xs leading-relaxed'>
            {t(
              'High-capacity task queue infrastructure and isolated routing clusters are currently being optimized prior to Enterprise availability.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Notice Banner */}
          <div className='border-amber-500/30 bg-amber-500/10 flex items-start gap-3 rounded-xl border p-3.5 text-xs'>
            <Info className='text-amber-400 mt-0.5 size-4 shrink-0' />
            <div className='leading-relaxed text-foreground/90'>
              <div className='font-semibold text-amber-400 mb-0.5'>
                {t('Infrastructure Upgrade Notice')}
              </div>
              <div>
                {t(
                  'The system currently prioritizes Pay As You Go workloads. Once the server cluster and task queue routing are finalized, Enterprise pre-orders will open.'
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className='border-border/60 bg-muted/20 space-y-3 rounded-xl border p-4 text-xs font-mono'>
            <div className='font-semibold text-foreground tracking-wide uppercase text-[11px]'>
              // {t('Contact & Waitlist Information')}
            </div>

            {email ? (
              <div className='flex items-center gap-2.5'>
                <Mail className='text-muted-foreground size-4' />
                <span className='text-muted-foreground'>{t('Email')}:</span>
                <a
                  href={`mailto:${email}`}
                  className='text-primary font-medium hover:underline'
                >
                  {email}
                </a>
              </div>
            ) : null}

            {telegram ? (
              <div className='flex items-center gap-2.5'>
                <MessageSquare className='text-muted-foreground size-4' />
                <span className='text-muted-foreground'>{t('Telegram')}:</span>
                <a
                  href={
                    telegram.startsWith('http')
                      ? telegram
                      : `https://t.me/${telegram.replace('@', '')}`
                  }
                  target='_blank'
                  rel='noreferrer'
                  className='text-primary font-medium hover:underline'
                >
                  {telegram}
                </a>
              </div>
            ) : null}

            {!email && !telegram ? (
              <div className='text-muted-foreground leading-relaxed'>
                {t(
                  'Administrator has not configured direct email/telegram contact. Please check the system announcements board for updates.'
                )}
              </div>
            ) : null}
          </div>

          <div className='text-muted-foreground/80 text-center text-[11px]'>
            {t(
              'Thank you for your interest in {{systemName}}. We will announce when Enterprise infrastructure is ready.',
              { systemName }
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

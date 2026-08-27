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
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  CreditCard,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

interface PricingPlansProps {
  onContactEnterprise: () => void
}

export function PricingPlans({ onContactEnterprise }: PricingPlansProps) {
  const { t } = useTranslation()
  const { auth } = useAuthStore()
  const isAuthenticated = Boolean(auth.user)

  return (
    <div className='grid grid-auto-3 items-stretch gap-6'>
      {/* Tier 1: Free */}
      <div className='bg-card/60 border-border/80 hover:border-primary/40 relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 command-corner shadow-lg'>
        <div>
          <div className='mb-4 flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs'>
            <span className='text-muted-foreground'>01 // TRIAL</span>
            <span className='text-muted-foreground text-[10px]'>[TESTING]</span>
          </div>

          <div className='flex items-center gap-2.5 mb-2'>
            <div className='bg-muted/40 text-muted-foreground flex size-8 items-center justify-center rounded-xl border border-border/80'>
              <Sparkles className='size-4' />
            </div>
            <h2 className='text-fluid-h3 font-bold tracking-tight'>
              {t('Free Tier')}
            </h2>
          </div>

          <p className='text-muted-foreground mt-2 min-h-[38px] text-xs leading-relaxed'>
            {t(
              'Explore standard AI models and test API integrations with complimentary credits.'
            )}
          </p>

          <div className='my-6 border-y border-border/60 py-4 font-mono'>
            <div className='flex items-baseline gap-1'>
              <span className='text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground'>
                $0
              </span>
              <span className='text-muted-foreground text-xs'>
                / {t('forever')}
              </span>
            </div>
            <p className='text-muted-foreground/70 mt-1 text-[11px]'>
              {t('No credit card required')}
            </p>
          </div>

          <div className='space-y-3.5 text-xs'>
            <div className='text-muted-foreground text-[10px] font-mono font-semibold tracking-wider uppercase'>
              // {t('What is included')}
            </div>

            <ul className='space-y-2.5'>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Complimentary trial quota')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Access to essential AI models')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Standard rate limit (60 RPM)')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('1 active API key')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('7-day usage logs history')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-emerald-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Community support')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 pt-2'>
          <Button
            variant='outline'
            className='w-full h-11 rounded-full text-xs font-mono font-semibold border-border/80 hover:border-foreground/40'
            render={
              <Link to={isAuthenticated ? '/dashboard' : '/sign-up'}>
                {isAuthenticated
                  ? t('Go to Dashboard')
                  : t('Get Started Free')}
                <ArrowRight className='ml-2 size-3.5' />
              </Link>
            }
          />
        </div>
      </div>

      {/* Tier 2: Pay As You Go - HIGHLIGHTED / POPULAR */}
      <div className='bg-card/90 border-primary/70 shadow-2xl relative flex flex-col justify-between rounded-3xl border-2 p-6 sm:p-8 backdrop-blur-md transition-all duration-300 command-corner'>
        {/* Popular floating badge */}
        <div className='absolute -top-3.5 left-1/2 -translate-x-1/2'>
          <span className='inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground uppercase tracking-wider shadow-md'>
            ✦ {t('Most Popular')}
          </span>
        </div>

        <div>
          <div className='mb-4 flex items-center justify-between border-b border-primary/20 pb-3 font-mono text-xs'>
            <span className='text-primary font-bold'>02 // PAYG</span>
            <span className='text-primary text-[10px]'>[PRODUCTION]</span>
          </div>

          <div className='flex items-center gap-2.5 mb-2'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-xl border border-primary/30'>
              <Zap className='size-4' />
            </div>
            <h2 className='text-fluid-h3 font-bold tracking-tight'>
              {t('Pay As You Go')}
            </h2>
          </div>

          <p className='text-muted-foreground mt-2 min-h-[38px] text-xs leading-relaxed'>
            {t(
              'Only pay for what you consume. Top up whenever needed with non-expiring balance.'
            )}
          </p>

          <div className='my-6 border-y border-border/60 py-4 font-mono'>
            <div className='flex items-baseline gap-1'>
              <span className='text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground'>
                {t('Pay per token')}
              </span>
            </div>
            <p className='text-primary mt-1 text-[11px] font-medium'>
              {t('$0 base fee • Balance never expires')}
            </p>
          </div>

          <div className='space-y-3.5 text-xs'>
            <div className='text-primary text-[10px] font-mono font-semibold tracking-wider uppercase'>
              // {t('Everything in Free, plus:')}
            </div>

            <ul className='space-y-2.5'>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0 font-bold' />
                <span className='font-medium text-foreground'>
                  {t('Access 50+ flagship AI models (GPT-4o, Claude, Gemini, DeepSeek)')}
                </span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0 font-bold' />
                <span className='font-medium text-foreground'>
                  {t('Credits never expire')}
                </span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                <span>{t('Smart load balancing & automatic failover')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                <span>{t('Unlimited API keys & custom token management')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                <span>{t('High concurrency & customizable RPM')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                <span>{t('Real-time token analytics & billing audit')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Check className='text-primary mt-0.5 size-3.5 shrink-0' />
                <span>{t('Priority technical ticket support')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 pt-2'>
          <Button
            className='w-full h-11 rounded-full text-xs font-mono font-semibold bg-primary text-primary-foreground shadow-lg hover:opacity-90'
            render={
              <Link to={isAuthenticated ? '/wallet' : '/sign-up'}>
                <CreditCard className='mr-2 size-3.5' />
                {isAuthenticated
                  ? t('Top Up Wallet')
                  : t('Start with Pay As You Go')}
                <ArrowRight className='ml-2 size-3.5' />
              </Link>
            }
          />
        </div>
      </div>

      {/* Tier 3: Enterprise (Coming Soon / Under Development) */}
      <div className='bg-card/60 border-border/80 hover:border-amber-500/40 relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 backdrop-blur-md transition-all duration-300 command-corner shadow-lg'>
        <div>
          <div className='mb-4 flex items-center justify-between border-b border-border/60 pb-3 font-mono text-xs'>
            <span className='text-amber-400 font-semibold'>03 // COMING SOON</span>
            <span className='rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 font-mono font-medium uppercase'>
              [IN_DEVELOPMENT]
            </span>
          </div>

          <div className='flex items-center gap-2.5 mb-2'>
            <div className='bg-amber-500/10 text-amber-400 flex size-8 items-center justify-center rounded-xl border border-amber-500/30'>
              <Building2 className='size-4' />
            </div>
            <h2 className='text-fluid-h3 font-bold tracking-tight'>
              {t('Enterprise')}
            </h2>
          </div>

          <p className='text-muted-foreground mt-2 min-h-[38px] text-xs leading-relaxed'>
            {t(
              'Dedicated task queue infrastructure and isolated routing clusters are currently under active development.'
            )}
          </p>

          <div className='my-6 border-y border-border/60 py-4 font-mono'>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground'>
                {t('Coming Soon')}
              </span>
              <span className='text-xs text-amber-400 font-semibold uppercase tracking-wider'>
                ({t('In Development')})
              </span>
            </div>
            <p className='text-muted-foreground/70 mt-1 text-[11px]'>
              {t('Please wait for upcoming infrastructure upgrades')}
            </p>
          </div>

          <div className='space-y-3.5 text-xs'>
            <div className='text-muted-foreground text-[10px] font-mono font-semibold tracking-wider uppercase'>
              // {t('Planned features roadmap:')}
            </div>

            <ul className='space-y-2.5 text-muted-foreground'>
              <li className='flex items-start gap-2.5'>
                <Clock className='text-amber-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('High-capacity dedicated task queue')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Clock className='text-amber-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Isolated upstream channels & dedicated VPC routing')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Clock className='text-amber-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('99.9% Uptime SLA & 24/7 technical support')}</span>
              </li>
              <li className='flex items-start gap-2.5'>
                <Clock className='text-amber-400 mt-0.5 size-3.5 shrink-0' />
                <span>{t('Enterprise corporate contracts & custom invoicing')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 pt-2'>
          <Button
            variant='outline'
            className='w-full h-11 rounded-full text-xs font-mono font-semibold border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors'
            onClick={onContactEnterprise}
          >
            <Clock className='mr-2 size-3.5' />
            {t('Join Waitlist')}
          </Button>
        </div>
      </div>
    </div>
  )
}

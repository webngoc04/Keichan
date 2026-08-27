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
import { Check, Sparkles, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Logo } from '@/assets/logo'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='relative min-h-svh w-full bg-background overflow-hidden flex flex-col justify-between'>
      {/* Background Glows */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 opacity-30 dark:opacity-[0.15]'
        style={{
          background: [
            'radial-gradient(ellipse 60% 50% at 15% 20%, oklch(0.65 0.24 285 / 70%) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 40% at 85% 85%, oklch(0.60 0.20 280 / 40%) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black_20%,transparent_100%)] bg-[size:3.5rem_3.5rem] opacity-[0.07]'
      />

      {/* Top Bar for Mobile & Logo Link */}
      <header className='w-full px-6 py-4 flex items-center justify-between z-20'>
        <Link
          to='/'
          className='flex items-center gap-2.5 transition-opacity hover:opacity-80'
        >
          <div className='relative h-8 w-8 shrink-0'>
            {(() => {
              if (loading) {
                return <Skeleton className='absolute inset-0 rounded-lg' />
              }
              if (logo) {
                return (
                  <img
                    src={logo}
                    alt={t('Logo')}
                    className='h-8 w-8 rounded-lg object-contain'
                  />
                )
              }
              return <Logo className='h-8 w-8 rounded-lg' />
            })()}
          </div>
          {loading ? (
            <Skeleton className='h-6 w-24' />
          ) : (
            <span className='text-base font-bold tracking-tight text-foreground'>
              {systemName || 'Keichan'}
            </span>
          )}
        </Link>

        <div className='hidden sm:inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1 font-mono text-[11px] text-muted-foreground'>
          <span className='size-2 rounded-full bg-emerald-400 animate-pulse' />
          <span>{t('GATEWAY STATUS: READY')}</span>
        </div>
      </header>

      {/* Main 2-Column Split Content */}
      <main className='flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
        <div className='mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16'>
          
          {/* Left Column: CommandCode Tech Showcase (Visible on Large Screens) */}
          <div className='hidden lg:flex lg:col-span-6 flex-col justify-center text-left space-y-6'>
            <div className='inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary w-fit'>
              <Sparkles className='size-3 animate-pulse' />
              <span>{t('THE UNIFIED AI GATEWAY')}</span>
            </div>

            <h1 className='text-[clamp(2.1rem,3.8vw,3.25rem)] font-bold tracking-tight leading-[1.12]'>
              {t('Unified API Gateway for')}
              <br />
              <span className='bg-gradient-to-r from-violet-400 via-primary to-purple-400 bg-clip-text text-transparent'>
                {t('Vast Range of AI Models')}
              </span>
            </h1>

            <p className='mt-2 text-sm text-muted-foreground leading-relaxed max-w-md md:text-base'>
              {t(
                'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
              )}
            </p>

            {/* Terminal Card Mockup */}
            <div className='rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md overflow-hidden command-corner shadow-xl font-mono text-xs'>
              <div className='flex items-center justify-between border-b border-border/60 bg-muted/20 px-3.5 py-2 text-[11px] text-muted-foreground'>
                <div className='flex items-center gap-2'>
                  <Terminal className='size-3 text-primary' />
                  <span>auth-session.sh</span>
                </div>
                <span className='text-emerald-400 font-semibold'>200 OK</span>
              </div>
              <div className='p-4 space-y-2 text-muted-foreground text-[11.5px] leading-relaxed'>
                <div className='text-foreground/90'>
                  <span className='text-primary'>$</span> curl -X POST https://api.newapi.pro/v1/chat/completions \
                </div>
                <div className='pl-3 text-muted-foreground'>
                  -H &quot;Authorization: Bearer sk-••••••••••••&quot;
                </div>
                <div className='pt-2 border-t border-border/40 text-emerald-400 flex items-center gap-2'>
                  <Check className='size-3.5' />
                  <span>{t('Token Verified: Full Model Quota Active')}</span>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className='flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground'>
              <span className='rounded-full border border-border/80 bg-card/40 px-3 py-1'>
                [AES-256 VAULT]
              </span>
              <span className='rounded-full border border-border/80 bg-card/40 px-3 py-1'>
                [PASSKEY FIDO2]
              </span>
              <span className='rounded-full border border-border/80 bg-card/40 px-3 py-1'>
                [99.9% UPTIME]
              </span>
            </div>
          </div>

          {/* Right Column: Form Container Card */}
          <div className='w-full lg:col-span-6 flex justify-center'>
            <div className='w-full max-w-[440px] rounded-3xl border border-border/80 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl command-corner'>
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Meta */}
      <footer className='w-full py-4 text-center text-xs font-mono text-muted-foreground/60'>
        <span>&copy; {new Date().getFullYear()} {systemName || 'Keichan'}. {t('All rights reserved.')}</span>
      </footer>
    </div>
  )
}

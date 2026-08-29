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
import { ArrowRight, BookOpen, Check, Copy, Sparkles, Terminal, Activity } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CyberBadge } from '@/components/cyber/cyber-badge'
import { EdexTelemetryBar } from '@/components/cyber/edex-telemetry'
import { GlitchText } from '@/components/cyber/glitch-text'
import { ScrambleText } from '@/components/cyber/scramble-text'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [copied, setCopied] = useState(false)
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  const currentOrigin =
    (status?.server_address as string | undefined)?.trim() ||
    (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://keichan.indevs.in')

  const quickCommand = `${currentOrigin}/v1/chat/completions`

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(quickCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group border-border/80 hover:border-foreground/40 hover:bg-muted/50 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-mono font-medium transition-all'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground group-hover:text-foreground size-3.5 transition-colors' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group border-border/80 hover:border-foreground/40 hover:bg-muted/50 inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-mono font-medium transition-all'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground group-hover:text-foreground size-3.5 transition-colors' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <section className='relative z-10 px-4 pt-20 pb-16 sm:px-6 md:pt-28 md:pb-20 lg:pt-32'>
      {/* Outer eDEX-UI Cyber Frame with Animated Border Beam & HUD Corners */}
      <div className='mx-auto max-w-[1220px] rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden command-corner border-beam-animated hud-corner relative'>
        
        {/* Top eDEX-UI Telemetry Bar */}
        <EdexTelemetryBar
          latency='<15ms'
          nodeName='KEICHAN-CORE'
          channelsCount='50+'
        />

        {/* Hero Main Content */}
        <div className='grid grid-cols-1 items-center gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 lg:p-12'>
          {/* Left Column: Headline, badges, description, CTAs */}
          <div className='flex flex-col items-start text-left lg:col-span-6'>
            {/* CommandCode Tag Badge */}
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[11px] font-mono text-primary'>
              <Sparkles className='size-3 animate-pulse' />
              <ScrambleText text={t('THE UNIFIED AI GATEWAY')} speed={22} />
            </div>

            <h1 className='text-[clamp(2.25rem,4vw,3.5rem)] font-bold tracking-tight leading-[1.1] font-mono'>
              <GlitchText as='span'>
                {t('UNIFIED API GATEWAY')}
              </GlitchText>
              <br />
              <span className='bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent matrix-stream-glow'>
                {t('MULTI-PROVIDER PROXY')}
              </span>
            </h1>

            <p className='mt-4 max-w-lg text-sm text-muted-foreground leading-relaxed font-mono'>
              {t(
                'High-throughput OpenAI-compatible reverse proxy with dynamic load balancing, real-time token accounting, failover routing, and zero-overhead SSE streaming.'
              )}
            </p>

            {/* Quick Command Snippet Bar */}
            <div className='mt-6 w-full max-w-lg rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 flex items-center justify-between font-mono text-xs shadow-xs'>
              <div className='flex items-center gap-2 overflow-hidden text-muted-foreground'>
                <Terminal className='size-3.5 text-primary shrink-0' />
                <span className='truncate text-foreground/80'>{quickCommand}</span>
              </div>
              <button
                type='button'
                onClick={handleCopyCommand}
                aria-label={t('Copy CLI command')}
                className='ml-2 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              >
                {copied ? (
                  <Check className='size-3.5 text-emerald-500' />
                ) : (
                  <Copy className='size-3.5' />
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className='mt-8 flex flex-wrap items-center gap-3'>
              {props.isAuthenticated ? (
                <>
                  <Button
                    className='group h-10 rounded-full px-6 text-xs font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-90'
                    render={<Link to='/dashboard' />}
                  >
                    {t('Go to Dashboard')}
                    <ArrowRight className='ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Button>
                  {renderDocsButton()}
                </>
              ) : (
                <>
                  <Button
                    className='group h-10 rounded-full px-6 text-xs font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-90'
                    render={<Link to='/sign-up' />}
                  >
                    {t('Get Started')}
                    <ArrowRight className='ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
                  </Button>
                  <Button
                    variant='outline'
                    className='border-border/80 hover:border-foreground/40 hover:bg-muted/50 h-10 rounded-full px-5 text-xs font-mono font-medium'
                    render={<Link to='/pricing' />}
                  >
                    {t('View Pricing')}
                  </Button>
                  {renderDocsButton()}
                </>
              )}
            </div>
          </div>

          {/* Right Column: Hero Terminal Demo */}
          <div className='w-full lg:col-span-6'>
            <HeroTerminalDemo />
          </div>
        </div>
      </div>
    </section>
  )
}

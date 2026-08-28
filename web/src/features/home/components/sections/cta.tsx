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
import { ArrowRight, Layers, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { GlitchText } from '@/components/cyber/glitch-text'
import { ScrambleText } from '@/components/cyber/scramble-text'
import { Button } from '@/components/ui/button'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  return (
    <section className='relative z-10 px-4 py-16 sm:px-6 md:py-24 max-w-[1280px] mx-auto'>
      <AnimateInView
        className='rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 via-card/50 to-card/20 p-8 sm:p-12 md:p-16 text-center backdrop-blur-md relative overflow-hidden command-corner hud-corner shadow-2xl font-mono'
        animation='scale-in'
      >
        {/* Background tactical glow */}
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_70%)]' />

        {/* Telemetry Tag */}
        <div className='relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-[11px] font-mono text-primary uppercase tracking-wider'>
          <Sparkles className='size-3 text-primary animate-pulse' />
          <ScrambleText text={`// ${t('JOIN_THE_NETWORK')}`} speed={25} />
        </div>

        {/* Title */}
        <h2 className='relative z-10 text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight max-w-3xl mx-auto font-mono text-foreground'>
          <GlitchText as='span'>
            {t('DEPLOY UNIFIED API GATEWAY')}
          </GlitchText>
          <br />
          <span className='bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent matrix-stream-glow'>
            {t('START ROUTING IN SECONDS')}
          </span>
        </h2>

        {/* Subtitle */}
        <p className='relative z-10 mt-5 max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed font-mono'>
          {t(
            'Standardize all upstream AI model providers with zero protocol overhead and instant key provisioning.'
          )}
        </p>

        {/* Action Buttons: 1. Tham gia ngay / 2. Xem models */}
        <div className='relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3.5'>
          {props.isAuthenticated ? (
            <Button
              className='group h-11 rounded-full px-7 text-xs sm:text-sm font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-90 font-mono'
              render={<Link to='/dashboard' />}
            >
              {t('Go to Dashboard')}
              <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          ) : (
            <Button
              className='group h-11 rounded-full px-7 text-xs sm:text-sm font-semibold shadow-md bg-primary text-primary-foreground hover:opacity-90 font-mono'
              render={<Link to='/sign-up' />}
            >
              {t('Get Started')}
              <ArrowRight className='ml-2 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
            </Button>
          )}

          <Button
            variant='outline'
            className='border-border/80 hover:border-foreground/40 hover:bg-muted/50 h-11 rounded-full px-6 text-xs sm:text-sm font-mono font-medium'
            render={<Link to='/models' />}
          >
            <Layers className='mr-2 size-4 text-cyan-400' />
            {t('Explore Models')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}

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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

/**
 * EdexAudioSpectrum: eDEX-UI inspired animated audio-frequency equalizer bars
 * 100% GPU-accelerated with pure CSS transforms (0 React re-renders, 0 forced reflows)
 */
export function EdexAudioSpectrum({ className, bars = 8 }: { className?: string; bars?: number }) {
  const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.25, 0.7]
  const durations = [0.75, 0.95, 0.65, 1.05, 0.8, 0.9, 0.7, 0.85]

  return (
    <div className={cn('flex items-end gap-0.5 h-3.5 px-1 py-0.5', className)} aria-hidden='true'>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className='w-1 h-full bg-gradient-to-t from-primary/40 via-primary to-cyan-400 rounded-t-[1px] audio-bar-anim'
          style={{
            animationDelay: `-${delays[i % delays.length]}s`,
            animationDuration: `${durations[i % durations.length]}s`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * EdexTelemetryBar: Tactical HUD Telemetry strip showing real-time node telemetry (KISS for SaaS)
 */
export function EdexTelemetryBar({
  latency,
  nodeName = 'KEICHAN-GATEWAY',
  channelsCount = '50+',
  className,
}: {
  latency?: string
  nodeName?: string
  channelsCount?: string
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between border-b border-border/80 bg-muted/20 px-3.5 py-2 font-mono text-[11px] text-muted-foreground backdrop-blur-md',
        className
      )}
    >
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-1.5 text-foreground font-semibold'>
          <span className='pulse-radar-dot size-2 rounded-full bg-emerald-400 inline-block' />
          <span>[{t('SYS')}: {nodeName}]</span>
        </div>
        <span className='hidden sm:inline-block text-muted-foreground/50'>//</span>
        <span className='hidden sm:inline-block text-cyan-400'>
          [{t('UPSTREAM')}: {channelsCount} {t('ADAPTORS')}]
        </span>
      </div>

      <div className='flex items-center gap-3'>
        <EdexAudioSpectrum bars={8} className='hidden md:flex' />
        {latency && (
          <span className='rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold'>
            {t('RTT')}: {latency}
          </span>
        )}
        <span className='text-emerald-400 font-semibold font-mono'>
          [{t('ONLINE')}]
        </span>
      </div>
    </div>
  )
}

/**
 * EdexSystemMeter: eDEX-UI tactile resource telemetry meter
 */
export function EdexSystemMeter({
  label,
  value,
  max = 100,
  unit = '%',
  color = 'cyan',
  className,
}: {
  label: string
  value: number
  max?: number
  unit?: string
  color?: 'cyan' | 'emerald' | 'violet' | 'amber'
  className?: string
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  const colorMap = {
    cyan: 'from-cyan-500 to-cyan-400 text-cyan-400 border-cyan-500/30',
    emerald: 'from-emerald-500 to-emerald-400 text-emerald-400 border-emerald-500/30',
    violet: 'from-violet-500 to-violet-400 text-violet-400 border-violet-500/30',
    amber: 'from-amber-500 to-amber-400 text-amber-400 border-amber-500/30',
  }[color]

  return (
    <div className={cn('p-2.5 rounded-lg border border-border/80 bg-background/50 font-mono text-xs', className)}>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-muted-foreground uppercase text-[10px] tracking-wider'>{label}</span>
        <span className='font-bold text-foreground'>
          {value}
          {unit}
        </span>
      </div>
      <div className='h-1.5 w-full bg-muted/40 rounded-full overflow-hidden'>
        <div
          className={cn('h-full bg-gradient-to-r transition-all duration-300 rounded-full', colorMap)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

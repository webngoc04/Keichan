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
import { cn } from '@/lib/utils'

/**
 * EdexAudioSpectrum: eDEX-UI inspired animated audio-frequency equalizer bars
 */
export function EdexAudioSpectrum({ className, bars = 16 }: { className?: string; bars?: number }) {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: bars }, () => Math.floor(Math.random() * 80) + 20)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(Array.from({ length: bars }, () => Math.floor(Math.random() * 85) + 15))
    }, 140)
    return () => clearInterval(interval)
  }, [bars])

  return (
    <div className={cn('flex items-end gap-0.5 h-6 px-1 py-0.5', className)} aria-hidden='true'>
      {heights.map((h, i) => (
        <span
          key={i}
          className='w-1 bg-gradient-to-t from-primary/40 via-primary to-cyan-400 rounded-t-[1px] transition-all duration-150'
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

/**
 * EdexTelemetryBar: Tactical HUD Telemetry strip showing real-time node telemetry
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
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const d = new Date()
      setTimeStr(
        d.toLocaleTimeString('en-GB', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

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
          <span>[SYS: {nodeName}]</span>
        </div>
        <span className='hidden sm:inline-block text-muted-foreground/50'>//</span>
        <span className='hidden sm:inline-block text-cyan-400'>
          [UPSTREAM: {channelsCount} ADAPTORS]
        </span>
      </div>

      <div className='flex items-center gap-3'>
        <EdexAudioSpectrum bars={8} className='hidden md:flex' />
        {latency && (
          <span className='rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold'>
            RTT: {latency}
          </span>
        )}
        <span className='text-foreground/80 font-semibold'>{timeStr} UTC</span>
      </div>
    </div>
  )
}

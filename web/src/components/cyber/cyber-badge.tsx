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
import { cn } from '@/lib/utils'

interface CyberBadgeProps {
  label: string
  tag?: string
  pulseColor?: 'emerald' | 'violet' | 'amber' | 'cyan'
  className?: string
  glow?: boolean
}

/**
 * CyberBadge renders monospace technical telemetry tags with radar pulse and HUD framing.
 */
export function CyberBadge({
  label,
  tag,
  pulseColor = 'emerald',
  className,
  glow = false,
}: CyberBadgeProps) {
  const dotColorClass = {
    emerald: 'bg-emerald-400',
    violet: 'bg-violet-400',
    amber: 'bg-amber-400',
    cyan: 'bg-cyan-400',
  }[pulseColor]

  return (
    <div
      className={cn(
        'metric-badge group relative overflow-hidden transition-all duration-200',
        glow && 'hover:border-primary/50 hover:shadow-sm',
        className
      )}
    >
      <span
        className={cn(
          'pulse-radar-dot relative inline-flex size-1.5 shrink-0 rounded-full',
          dotColorClass
        )}
      />
      {tag && (
        <span className='text-muted-foreground/70 font-mono text-[10px] uppercase'>
          {tag}:
        </span>
      )}
      <span className='font-mono text-[11px] font-semibold text-foreground/90'>
        {label}
      </span>
    </div>
  )
}

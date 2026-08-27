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
import {
  Activity,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { cn } from '@/lib/utils'

export function Data() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 font-mono text-[11px] text-emerald-400 uppercase tracking-wider'>
            <Activity className='size-3.5 animate-pulse' />
            <span>// {t('NETWORK TELEMETRY & STATUS')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Global Network Health')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Real-time metrics, node latency, uptime stats, and operational indicators across global gateway clusters.'
            )}
          </p>
        </div>

        {/* Status Metrics Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12'>
          {[
            { label: t('Overall Uptime'), value: '99.98%', sub: t('Last 90 days'), color: 'text-emerald-400' },
            { label: t('Median Gateway TTFT'), value: '14.2ms', sub: t('Sub-50ms global SLA'), color: 'text-primary' },
            { label: t('Active Upstream Nodes'), value: '48 Nodes', sub: t('Across 12 regions'), color: 'text-foreground' },
            { label: t('Failover Success Rate'), value: '100.0%', sub: t('Zero hard dropouts'), color: 'text-emerald-400' },
           ].map((stat) => (
            <div
              key={stat.label}
              className='rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md command-corner'
            >
              <div className='font-mono text-xs text-muted-foreground mb-2'>
                // {stat.label}
              </div>
              <div className={cn('text-2xl sm:text-3xl font-extrabold font-mono tracking-tight', stat.color)}>
                {stat.value}
              </div>
              <div className='text-[11px] text-muted-foreground font-mono mt-1'>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Region Latency Table */}
        <div className='rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md command-corner p-6'>
          <h3 className='font-mono text-sm font-bold text-foreground mb-4'>
            // {t('Regional Gateway Points of Presence')}
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs'>
            {[
              { region: 'US East (N. Virginia)', status: 'Optimal', latency: '4ms' },
              { region: 'US West (Oregon)', status: 'Optimal', latency: '6ms' },
              { region: 'Europe (Frankfurt)', status: 'Optimal', latency: '12ms' },
              { region: 'Asia East (Tokyo)', status: 'Optimal', latency: '18ms' },
              { region: 'Asia South (Singapore)', status: 'Optimal', latency: '15ms' },
              { region: 'Australia (Sydney)', status: 'Optimal', latency: '24ms' },
            ].map((pop) => (
              <div
                key={pop.region}
                className='flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 p-3.5'
              >
                <div>
                  <div className='font-semibold text-foreground'>
                    {pop.region}
                  </div>
                  <div className='flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5'>
                    <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
                    <span>{pop.status}</span>
                  </div>
                </div>
                <div className='text-muted-foreground font-bold'>
                  {pop.latency}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

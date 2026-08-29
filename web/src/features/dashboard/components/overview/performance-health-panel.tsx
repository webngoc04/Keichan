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
import { useQuery } from '@tanstack/react-query'
import { Gauge, HeartPulse, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IconBadge, type IconBadgeTone } from '@/components/ui/icon-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getPerfMetricsSummary } from '@/features/performance-metrics/api'
import {
  formatLatency,
  formatThroughput,
  formatUptimePct,
  getSuccessRateDotClass,
  getSuccessRateTextClass,
} from '@/features/performance-metrics/lib/format'
import type { PerfModelSummary } from '@/features/performance-metrics/types'
import { cn } from '@/lib/utils'

const PERFORMANCE_WINDOW_HOURS = 24
const TOP_MODEL_LIMIT = 6

type WeightedMetric = 'avg_latency_ms' | 'avg_tps' | 'success_rate'

function simpleAverage(
  rows: PerfModelSummary[],
  metric: WeightedMetric,
  isValid: (value: number) => boolean
): number {
  let total = 0
  let count = 0
  for (const row of rows) {
    const value = Number(row[metric])
    if (!isValid(value)) continue
    total += value
    count++
  }
  return count > 0 ? total / count : Number.NaN
}

export function PerformanceHealthPanel() {
  const { t } = useTranslation()
  const metricsQuery = useQuery({
    queryKey: ['perf-metrics-summary', PERFORMANCE_WINDOW_HOURS],
    queryFn: () => getPerfMetricsSummary(PERFORMANCE_WINDOW_HOURS),
    staleTime: 60 * 1000,
    retry: false,
  })

  const models = useMemo(
    () => metricsQuery.data?.data.models ?? [],
    [metricsQuery.data]
  )

  const summary = useMemo(() => {
    return {
      avgLatencyMs: Math.round(
        simpleAverage(
          models,
          'avg_latency_ms',
          (v) => Number.isFinite(v) && v > 0
        )
      ),
      avgTps: simpleAverage(
        models,
        'avg_tps',
        (v) => Number.isFinite(v) && v > 0
      ),
      successRate: simpleAverage(models, 'success_rate', Number.isFinite),
    }
  }, [models])

  const topModels = useMemo(() => models.slice(0, TOP_MODEL_LIMIT), [models])
  const loading = metricsQuery.isLoading
  const hasData = models.length > 0

  return (
    <section className='glass-card h-full overflow-hidden rounded-2xl border border-border/80 shadow-xs backdrop-blur-xl'>
      <div className='flex items-center gap-2 border-b border-border/70 bg-muted/10 px-4 py-3 sm:px-5'>
        <IconBadge tone='success' size='sm'>
          <HeartPulse />
        </IconBadge>
        <div className='flex flex-col'>
          <h3 className='text-sm font-semibold tracking-tight text-foreground'>{t('Performance health')}</h3>
        </div>
        <span className='text-muted-foreground ml-auto font-mono text-[11px]'>
          {t('Performance metrics for the last 24 hours')}
        </span>
      </div>

      <div className='space-y-4 p-4 sm:p-5'>
        <div className='grid grid-auto-3 gap-2.5'>
          <MetricCell
            icon={HeartPulse}
            label={t('Success rate')}
            value={formatUptimePct(summary.successRate)}
            loading={loading}
            valueClassName={getSuccessRateTextClass(summary.successRate)}
            tone='success'
          />
          <MetricCell
            icon={Timer}
            label={t('Average latency')}
            value={formatLatency(summary.avgLatencyMs)}
            loading={loading}
            tone='warning'
          />
          <MetricCell
            icon={Gauge}
            label={t('Throughput')}
            value={formatThroughput(summary.avgTps)}
            loading={loading}
            tone='info'
          />
        </div>

        {loading ? (
          <div className='space-y-1.5'>
            {['success', 'latency', 'throughput'].map((key) => (
              <Skeleton key={key} className='h-6 w-full rounded-lg' />
            ))}
          </div>
        ) : (
          hasData && (
            <div className='bg-muted/10 rounded-xl border border-border/60 p-3'>
              <span className='text-muted-foreground mb-2 block font-mono text-[11px] font-semibold uppercase tracking-wider'>
                // {t('Top models by traffic')}
              </span>
              <div className='grid grid-auto-2 gap-2'>
                {topModels.map((model) => (
                  <div
                    key={model.model_name}
                    className='flex items-center justify-between gap-2 rounded-lg bg-background/50 border border-border/40 px-2.5 py-1.5 backdrop-blur-sm'
                  >
                    <span className='min-w-0 flex-1 truncate font-mono text-xs font-medium text-foreground'>
                      {model.model_name}
                    </span>
                    <span className='inline-flex shrink-0 items-center gap-1.5 bg-muted/30 px-2 py-0.5 rounded-full border border-border/40'>
                      <span
                        className={cn(
                          'size-1.5 rounded-full shadow-[0_0_6px_currentColor]',
                          getSuccessRateDotClass(model.success_rate)
                        )}
                        aria-hidden='true'
                      />
                      <span
                        className={cn(
                          'font-mono text-xs font-semibold tabular-nums',
                          getSuccessRateTextClass(model.success_rate)
                        )}
                      >
                        {formatUptimePct(model.success_rate)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  )
}

function MetricCell(props: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  loading: boolean
  valueClassName?: string
  tone: IconBadgeTone
}) {
  const Icon = props.icon
  return (
    <div className='bg-background/60 rounded-xl border border-border/60 p-3 shadow-xs backdrop-blur-sm'>
      <div className='text-muted-foreground flex items-center gap-1.5 font-mono text-[11px] font-medium'>
        <IconBadge tone={props.tone} size='xs'>
          <Icon />
        </IconBadge>
        <span className='truncate'>{props.label}</span>
      </div>
      {props.loading ? (
        <Skeleton className='mt-2 h-5 w-16' />
      ) : (
        <div
          className={cn(
            'mt-2 font-mono text-base font-bold tabular-nums text-foreground tracking-tight',
            props.valueClassName
          )}
        >
          {props.value}
        </div>
      )}
    </div>
  )
}

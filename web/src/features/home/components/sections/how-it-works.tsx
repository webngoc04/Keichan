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
import { BarChart3, Key, Route } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'

export function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01',
      tag: 'REQUEST_DISPATCH',
      title: t('Configure & Authorize'),
      desc: t(
        'Generate standard API keys, set spending quotas, and map model aliases for your application.'
      ),
      icon: <Key className='size-5 text-primary' strokeWidth={1.5} />,
      detail: 'Bearer sk-•••• -> Auth Token Validator',
    },
    {
      num: '02',
      tag: 'SMART_ROUTING',
      title: t('Dynamic Routing & Failover'),
      desc: t(
        'The gateway inspects the model payload, applies load balancing, and relays to the optimal upstream channel.'
      ),
      icon: <Route className='size-5 text-violet-400' strokeWidth={1.5} />,
      detail: 'Round-Robin / Health Check / Expression Pricing',
    },
    {
      num: '03',
      tag: 'STREAMING_&_AUDIT',
      title: t('Monitor & Settle'),
      desc: t(
        'Stream tokens back with zero overhead. Real-time usage and consumption metrics are logged instantly.'
      ),
      icon: <BarChart3 className='size-5 text-emerald-400' strokeWidth={1.5} />,
      detail: 'SSE Stream + Quota Deduction + Audit Log',
    },
  ]

  return (
    <section className='relative z-10 border-t border-border/80 px-4 py-20 sm:px-6 md:py-28 max-w-[1220px] mx-auto'>
      <AnimateInView className='mb-14 max-w-xl'>
        <div className='mb-3 inline-flex items-center gap-2 font-mono text-xs text-primary font-medium tracking-wider uppercase'>
          <span>// 02 FLOW EXECUTION</span>
        </div>
        <h2 className='text-3xl sm:text-4xl font-bold tracking-tight leading-tight'>
          {t('Three steps to get started')}
        </h2>
      </AnimateInView>

      <div className='grid grid-auto-3 gap-6'>
        {steps.map((step, i) => (
          <AnimateInView
            key={step.num}
            delay={i * 100}
            animation='fade-up'
            className='relative rounded-2xl border border-border/80 bg-card/40 p-6 backdrop-blur-xs flex flex-col justify-between command-corner hover-tech-card'
          >
            <div>
              <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-5 font-mono text-xs'>
                <span className='text-primary font-bold'>{step.num}</span>
                <span className='text-muted-foreground text-[10px] tracking-wider'>[{step.tag}]</span>
              </div>

              <div className='flex items-center gap-3 mb-3'>
                <div className='flex size-9 items-center justify-center rounded-xl border border-border/80 bg-muted/40'>
                  {step.icon}
                </div>
                <h3 className='text-base font-semibold'>{step.title}</h3>
              </div>

              <p className='text-sm text-muted-foreground leading-relaxed mb-6'>
                {step.desc}
              </p>
            </div>

            <div className='rounded-xl border border-border/60 bg-muted/20 px-3 py-2 font-mono text-[11px] text-muted-foreground'>
              <span className='text-foreground/70'>$</span> {step.detail}
            </div>
          </AnimateInView>
        ))}
      </div>
    </section>
  )
}

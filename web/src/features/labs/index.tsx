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
  Binary,
  Cpu,
  FlaskConical,
  Gauge,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'

export function Labs() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 font-mono text-[11px] text-violet-400 uppercase tracking-wider'>
            <FlaskConical className='size-3.5' />
            <span>// {t('EXPERIMENTAL RESEARCH & PROTOTYPES')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Keichan Labs')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Experimental AI gateway algorithms, token compression techniques, speculative routing, and next-generation inference architectures.'
            )}
          </p>
        </div>

        {/* Labs Projects */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {[
            {
              icon: Zap,
              title: t('Speculative Multi-Channel Racing'),
              tag: 'EXPERIMENT',
              desc: t(
                'Sends early SYN probes across multiple upstream providers simultaneously to route streaming tokens to whichever provider yields the lowest TTFT.'
              ),
              status: t('Alpha Testing'),
            },
            {
              icon: Binary,
              title: t('Context Token Deduplication'),
              tag: 'RESEARCH',
              desc: t(
                'Identifies repeated system prompts and document context chunks to utilize upstream prompt caching and reduce token billing overhead by up to 80%.'
              ),
              status: t('Prototype'),
            },
            {
              icon: Cpu,
              title: t('Hybrid Cloud / Local GPU Router'),
              tag: 'ARCHITECTURE',
              desc: t(
                'Automatically offloads sensitive prompts or short classification tasks to local Ollama/vLLM instances, while dispatching heavy reasoning to frontier cloud APIs.'
              ),
              status: t('Research'),
            },
            {
              icon: Gauge,
              title: t('Real-Time Model Quality Drift Monitoring'),
              tag: 'ANALYTICS',
              desc: t(
                'Continuous automated synthetic benchmarking evaluating output variance, refusal rates, and formatting anomalies across upstream versions.'
              ),
              status: t('Concept'),
            },
          ].map((exp) => {
            const Icon = exp.icon
            return (
              <div
                key={exp.title}
                className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md command-corner hover-tech-card shadow-lg'
              >
                <div>
                  <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
                    <span className='rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 border border-violet-500/20'>
                      [{exp.tag}]
                    </span>
                    <span className='text-[11px] text-muted-foreground font-mono'>
                      {exp.status}
                    </span>
                  </div>

                  <div className='flex items-center gap-3 mb-3'>
                    <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-violet-400 shadow-inner'>
                      <Icon className='size-5' />
                    </div>
                    <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                      {exp.title}
                    </h3>
                  </div>

                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    {exp.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PublicLayout>
  )
}

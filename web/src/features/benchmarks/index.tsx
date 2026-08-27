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
import { useState } from 'react'
import {
  ArrowUpDown,
  Gauge,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface BenchmarkModel {
  id: string
  name: string
  provider: string
  reasoningScore: number // 0 - 100
  codingScore: number // 0 - 100
  speedTps: number // tokens / sec
  latencyTtft: number // ms
  inputPrice: number // $ per 1M tokens
  outputPrice: number // $ per 1M tokens
  contextWindow: string
  category: 'flagship' | 'reasoning' | 'coding' | 'fast'
  highlight?: string
}

const BENCHMARK_DATA: BenchmarkModel[] = [
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    reasoningScore: 96.8,
    codingScore: 94.2,
    speedTps: 42,
    latencyTtft: 450,
    inputPrice: 0.55,
    outputPrice: 2.19,
    contextWindow: '64k',
    category: 'reasoning',
    highlight: 'Top Open Reasoning',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    reasoningScore: 95.4,
    codingScore: 97.2,
    speedTps: 68,
    latencyTtft: 280,
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: '200k',
    category: 'coding',
    highlight: '#1 Code Architecture',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    reasoningScore: 93.6,
    codingScore: 92.8,
    speedTps: 85,
    latencyTtft: 240,
    inputPrice: 2.5,
    outputPrice: 10.0,
    contextWindow: '128k',
    category: 'flagship',
    highlight: 'Multimodal Flagship',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    reasoningScore: 92.1,
    codingScore: 89.5,
    speedTps: 72,
    latencyTtft: 310,
    inputPrice: 1.25,
    outputPrice: 5.0,
    contextWindow: '2M',
    category: 'flagship',
    highlight: '2M Long Context',
  },
  {
    id: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B Instruct',
    provider: 'Alibaba',
    reasoningScore: 88.7,
    codingScore: 91.4,
    speedTps: 95,
    latencyTtft: 180,
    inputPrice: 0.35,
    outputPrice: 0.95,
    contextWindow: '128k',
    category: 'coding',
    highlight: 'High Performance / Cost',
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    reasoningScore: 87.5,
    codingScore: 88.0,
    speedTps: 110,
    latencyTtft: 150,
    inputPrice: 0.3,
    outputPrice: 0.8,
    contextWindow: '128k',
    category: 'fast',
    highlight: 'Open Weights Titan',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    reasoningScore: 91.2,
    codingScore: 90.6,
    speedTps: 60,
    latencyTtft: 320,
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: '64k',
    category: 'fast',
    highlight: 'Ultra Low Cost MoE',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    reasoningScore: 82.0,
    codingScore: 84.1,
    speedTps: 140,
    latencyTtft: 110,
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: '128k',
    category: 'fast',
    highlight: 'Fast Production Tier',
  },
]

export function Benchmarks() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'reasoning' | 'coding' | 'speed' | 'price'>('reasoning')

  const filtered = BENCHMARK_DATA.filter((m) => {
    const matchCat = activeCategory === 'all' || m.category === activeCategory
    const matchQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.provider.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  }).sort((a, b) => {
    if (sortBy === 'reasoning') return b.reasoningScore - a.reasoningScore
    if (sortBy === 'coding') return b.codingScore - a.codingScore
    if (sortBy === 'speed') return b.speedTps - a.speedTps
    if (sortBy === 'price') return a.inputPrice - b.inputPrice
    return 0
  })

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Hero */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Gauge className='size-3.5' />
            <span>// {t('AI MODEL BENCHMARKS')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Model Performance Matrix')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Comprehensive speed, reasoning, coding benchmarks and pricing efficiency across frontier AI models.'
            )}
          </p>
        </div>

        {/* Controls */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {[
              { id: 'all', label: t('All Models') },
              { id: 'reasoning', label: t('Deep Reasoning') },
              { id: 'coding', label: t('Coding & Agents') },
              { id: 'flagship', label: t('Flagship Multimodal') },
              { id: 'fast', label: t('High TPS & Cheap') },
            ].map((tab) => (
              <button
                type='button'
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  'rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all',
                  activeCategory === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Filter benchmark models...')}
              className='h-9 w-full sm:w-64 text-xs font-mono'
            />
          </div>
        </div>

        {/* Table / Grid */}
        <div className='overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md command-corner shadow-xl'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left text-xs font-mono'>
              <thead>
                <tr className='border-b border-border/80 bg-muted/40 text-[11px] text-muted-foreground uppercase'>
                  <th className='p-4 font-semibold'>// {t('Model')}</th>
                  <th
                    className='cursor-pointer p-4 text-center font-semibold hover:text-foreground'
                    onClick={() => setSortBy('reasoning')}
                  >
                    <div className='flex items-center justify-center gap-1'>
                      <span>{t('Reasoning (MMLU)')}</span>
                      <ArrowUpDown className='size-3' />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer p-4 text-center font-semibold hover:text-foreground'
                    onClick={() => setSortBy('coding')}
                  >
                    <div className='flex items-center justify-center gap-1'>
                      <span>{t('Coding Score')}</span>
                      <ArrowUpDown className='size-3' />
                    </div>
                  </th>
                  <th
                    className='cursor-pointer p-4 text-center font-semibold hover:text-foreground'
                    onClick={() => setSortBy('speed')}
                  >
                    <div className='flex items-center justify-center gap-1'>
                      <span>{t('Speed (TPS)')}</span>
                      <ArrowUpDown className='size-3' />
                    </div>
                  </th>
                  <th className='p-4 text-center font-semibold'>{t('TTFT')}</th>
                  <th
                    className='cursor-pointer p-4 text-right font-semibold hover:text-foreground'
                    onClick={() => setSortBy('price')}
                  >
                    <div className='flex items-center justify-end gap-1'>
                      <span>{t('Price / 1M')}</span>
                      <ArrowUpDown className='size-3' />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border/40'>
                {filtered.map((model, idx) => (
                  <tr
                    key={model.id}
                    className='hover:bg-muted/25 transition-colors group'
                  >
                    <td className='p-4'>
                      <div className='flex items-center gap-3'>
                        <span className='text-[10px] text-muted-foreground w-4'>
                          0{idx + 1}
                        </span>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-foreground text-[13px]'>
                              {model.name}
                            </span>
                            {model.highlight && (
                              <span className='rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary border border-primary/20'>
                                {model.highlight}
                              </span>
                            )}
                          </div>
                          <div className='text-[10.5px] text-muted-foreground mt-0.5'>
                            {model.provider} · {model.contextWindow} context
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reasoning Bar */}
                    <td className='p-4 text-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <span className='font-bold text-foreground'>
                          {model.reasoningScore}%
                        </span>
                        <div className='h-1.5 w-20 bg-muted/40 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-violet-400 rounded-full'
                            style={{ width: `${model.reasoningScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Coding Bar */}
                    <td className='p-4 text-center'>
                      <div className='flex flex-col items-center gap-1'>
                        <span className='font-bold text-foreground'>
                          {model.codingScore}%
                        </span>
                        <div className='h-1.5 w-20 bg-muted/40 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-emerald-400 rounded-full'
                            style={{ width: `${model.codingScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Speed */}
                    <td className='p-4 text-center'>
                      <span className='font-bold text-primary'>
                        {model.speedTps}{' '}
                        <span className='text-[10px] text-muted-foreground'>
                          tps
                        </span>
                      </span>
                    </td>

                    {/* Latency */}
                    <td className='p-4 text-center text-muted-foreground'>
                      {model.latencyTtft}ms
                    </td>

                    {/* Price */}
                    <td className='p-4 text-right'>
                      <div className='font-bold text-foreground'>
                        ${model.inputPrice} / ${model.outputPrice}
                      </div>
                      <div className='text-[10px] text-muted-foreground'>
                        in / out
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Footer Card */}
        <div className='mt-12 rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md text-center command-corner'>
          <h3 className='text-lg font-bold text-foreground'>
            {t('Ready to build with high-performance routing?')}
          </h3>
          <p className='text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto'>
            {t(
              'Switch between any benchmarked model with a single unified OpenAI-compatible API key.'
            )}
          </p>
          <div className='mt-5 flex items-center justify-center gap-3'>
            <Button
              className='rounded-full text-xs font-mono'
              render={<Link to='/sign-up' />}
            >
              {t('Get Started Free')}
            </Button>
            <Button
              variant='outline'
              className='rounded-full text-xs font-mono'
              render={<Link to='/pricing' />}
            >
              {t('View Full Pricing')}
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

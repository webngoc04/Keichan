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
  Network,
  Radio,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ProviderItem {
  id: string
  name: string
  region: string
  category: 'cloud' | 'frontier' | 'accelerated' | 'self-hosted'
  modelsCount: string
  capabilities: string[]
  status: 'operational' | 'active'
  latency: string
  description: string
  iconText: string
}

const PROVIDERS_DATA: ProviderItem[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    region: 'Global / US',
    category: 'frontier',
    modelsCount: '25+ Models',
    capabilities: ['Chat', 'Embeddings', 'DALL-E 3', 'Whisper', 'Realtime', 'Vision'],
    status: 'operational',
    latency: '12ms',
    description: 'GPT-4o, GPT-4o mini, o1, o3-mini, text-embedding-3 and multimodal audio suites.',
    iconText: 'OA',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    region: 'Global / US',
    category: 'frontier',
    modelsCount: '10+ Models',
    capabilities: ['Chat', 'Vision', 'Prompt Caching', 'Artifacts', 'Reasoning'],
    status: 'operational',
    latency: '16ms',
    description: 'Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus with extended 200k context.',
    iconText: 'CL',
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini & Vertex AI',
    region: 'Global Multiregion',
    category: 'frontier',
    modelsCount: '15+ Models',
    capabilities: ['Chat', 'Audio', 'Video', '2M Context', 'Embeddings'],
    status: 'operational',
    latency: '14ms',
    description: 'Gemini 1.5 Pro, 1.5 Flash, 2.0 Flash with native multimodality & massive context.',
    iconText: 'GO',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    region: 'Asia / Global',
    category: 'frontier',
    modelsCount: '6+ Models',
    capabilities: ['Reasoning', 'Chat', 'Code', 'Math', 'JSON Mode'],
    status: 'operational',
    latency: '15ms',
    description: 'DeepSeek R1 reasoning model and DeepSeek V3 671B MoE architecture at record efficiency.',
    iconText: 'DS',
  },
  {
    id: 'aws-bedrock',
    name: 'AWS Bedrock',
    region: 'Global VPC',
    category: 'cloud',
    modelsCount: '30+ Models',
    capabilities: ['Enterprise IAM', 'Claude', 'Llama 3', 'Titan', 'Mistral'],
    status: 'operational',
    latency: '22ms',
    description: 'Enterprise AWS cloud infrastructure with cross-region routing and IAM token governance.',
    iconText: 'AWS',
  },
  {
    id: 'azure-openai',
    name: 'Microsoft Azure OpenAI',
    region: 'Multi-Geography',
    category: 'cloud',
    modelsCount: '20+ Models',
    capabilities: ['PTU Quota', 'Content Filtering', 'Enterprise SLA', 'Private Endpoint'],
    status: 'operational',
    latency: '20ms',
    description: 'Dedicated Azure capacity pools, Provisioned Throughput Units and enterprise compliance.',
    iconText: 'AZ',
  },
  {
    id: 'groq',
    name: 'Groq LPU',
    region: 'US / North America',
    category: 'accelerated',
    modelsCount: '8+ Models',
    capabilities: ['Ultra High TPS', 'Real-time Voice', 'Llama 3', 'Mixtral', 'Whisper'],
    status: 'operational',
    latency: '8ms',
    description: 'Linear Processing Unit (LPU) silicon hardware delivering 500+ tokens/sec throughput.',
    iconText: 'GQ',
  },
  {
    id: 'together-ai',
    name: 'Together AI',
    region: 'US / EU',
    category: 'accelerated',
    modelsCount: '40+ Models',
    capabilities: ['Open Weights', 'Fine-Tuning', 'Custom Endpoints', 'Llama 3.3', 'Qwen'],
    status: 'operational',
    latency: '18ms',
    description: 'Decentralized cloud compute delivering open frontier models at high concurrency.',
    iconText: 'TG',
  },
  {
    id: 'vllm-ollama',
    name: 'vLLM / Ollama (Self-Hosted)',
    region: 'Private Cluster',
    category: 'self-hosted',
    modelsCount: 'Custom',
    capabilities: ['Local Weights', 'Private VPC', 'Zero Cloud Egress', 'PagedAttention'],
    status: 'operational',
    latency: '2ms',
    description: 'Connect your internal GPU clusters, on-prem servers, and local instances seamlessly.',
    iconText: 'LOC',
  },
]

export function Providers() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = PROVIDERS_DATA.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Network className='size-3.5' />
            <span>// {t('UPSTREAM PROVIDER ECOSYSTEM')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Integrated AI Providers')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Unified access to 40+ leading AI foundation model providers, hyperscale cloud networks, and private compute clusters.'
            )}
          </p>
        </div>

        {/* Filters */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {[
              { id: 'all', label: t('All Networks') },
              { id: 'frontier', label: t('Frontier Labs') },
              { id: 'cloud', label: t('Enterprise Clouds') },
              { id: 'accelerated', label: t('High-Speed LPUs & GPUs') },
              { id: 'self-hosted', label: t('Self-Hosted / Local') },
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

          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search provider network...')}
            className='h-9 w-full sm:w-64 text-xs font-mono'
          />
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((item) => (
            <div
              key={item.id}
              className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 command-corner hover-tech-card shadow-lg'
            >
              <div>
                <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
                  <div className='flex items-center gap-1.5 text-[11px] text-emerald-400'>
                    <span className='size-1.5 rounded-full bg-emerald-400 animate-pulse' />
                    <span>{t('Operational')}</span>
                  </div>
                  <span className='font-mono text-muted-foreground text-[11px]'>
                    ⚡ {item.latency}
                  </span>
                </div>

                <div className='flex items-center gap-3 mb-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 font-mono font-bold text-primary text-sm shadow-inner'>
                    {item.iconText}
                  </div>
                  <div>
                    <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                      {item.name}
                    </h3>
                    <div className='text-[11px] text-muted-foreground font-mono'>
                      {item.region} · {item.modelsCount}
                    </div>
                  </div>
                </div>

                <p className='text-xs text-muted-foreground leading-relaxed mb-4'>
                  {item.description}
                </p>
              </div>

              {/* Capabilities Chips */}
              <div className='pt-2'>
                <div className='flex flex-wrap gap-1'>
                  {item.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className='rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 font-mono text-[10px] text-foreground/80'
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Multiplexing Architecture Section */}
        <div className='mt-16 rounded-3xl border border-border/80 bg-card/60 p-8 backdrop-blur-md command-corner shadow-xl'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='space-y-2 max-w-xl'>
              <div className='inline-flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-wider font-semibold'>
                <Radio className='size-3.5' />
                <span>// {t('MULTI-CHANNEL LOAD BALANCING')}</span>
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
                {t('Configure multiple upstream channels per model')}
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                {t(
                  'Pool multiple accounts or cloud providers together. The gateway automatically executes weighted round-robin and circuit-breaker failovers.'
                )}
              </p>
            </div>
            <div className='flex items-center gap-3 shrink-0'>
              <Button
                className='rounded-full text-xs font-mono'
                render={<Link to='/channels' />}
              >
                {t('Manage Channels')}
              </Button>
              <Button
                variant='outline'
                className='rounded-full text-xs font-mono'
                render={<Link to='/pricing' />}
              >
                {t('Explore Rates')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

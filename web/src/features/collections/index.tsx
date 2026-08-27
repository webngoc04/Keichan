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
  ArrowRight,
  Brain,
  Code2,
  Compass,
  Database,
  Eye,
  FileText,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'

interface CollectionItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: typeof Brain
  badge: string
  models: { name: string; tag: string; price: string }[]
  useCases: string[]
}

const COLLECTIONS_DATA: CollectionItem[] = [
  {
    id: 'deep-reasoning',
    title: 'Deep Reasoning & Thinking',
    subtitle: 'Chain-of-thought & complex logic architectures',
    description: 'Autonomous reasoning models specialized in mathematics, STEM proofs, deep multi-step analysis, and structured problem solving.',
    icon: Brain,
    badge: 'REASONING',
    models: [
      { name: 'DeepSeek R1', tag: 'Open Weights Titan', price: '$0.55 / $2.19' },
      { name: 'OpenAI o1 & o3-mini', tag: 'Native Reasoning', price: '$1.10 / $4.40' },
      { name: 'Claude 3.5 Sonnet', tag: 'Structured Thinking', price: '$3.00 / $15.00' },
    ],
    useCases: ['Competitive coding', 'Scientific research', 'Financial analysis', 'Formal verification'],
  },
  {
    id: 'coding-agents',
    title: 'Coding & Agentic Automation',
    subtitle: 'High-accuracy code synthesis and tool calling',
    description: 'Engineered for full-codebase context comprehension, refactoring, bug reproduction, unit test generation, and terminal command execution.',
    icon: Code2,
    badge: 'SOFTWARE_DEV',
    models: [
      { name: 'Claude 3.5 Sonnet', tag: '#1 SWE-bench', price: '$3.00 / $15.00' },
      { name: 'Qwen 2.5 Coder 32B', tag: 'Top Open Code', price: '$0.20 / $0.60' },
      { name: 'DeepSeek V3', tag: '671B MoE', price: '$0.14 / $0.28' },
    ],
    useCases: ['Cursor & Cline pairing', 'Automated PR review', 'CI/CD debugging', 'API backend scaffold'],
  },
  {
    id: 'high-speed-cheap',
    title: 'High-Throughput & Low Latency',
    subtitle: 'Cost-effective models for bulk processing',
    description: 'Sub-second response models built for high-concurrency ingestion, customer support bots, data classification, and high-frequency streaming.',
    icon: Zap,
    badge: 'HIGH_TPS',
    models: [
      { name: 'GPT-4o mini', tag: '140+ TPS', price: '$0.15 / $0.60' },
      { name: 'Gemini 1.5 Flash', tag: 'Sub-200ms TTFT', price: '$0.075 / $0.30' },
      { name: 'Llama 3.3 70B', tag: '110 TPS', price: '$0.30 / $0.80' },
    ],
    useCases: ['Chatbots & triage', 'Content tagging', 'Email summarization', 'Real-time translation'],
  },
  {
    id: 'vision-multimodal',
    title: 'Multimodal Vision & Audio',
    subtitle: 'Image understanding, audio transcription and synthesis',
    description: 'Process diagrams, screenshots, OCR documents, architectural blueprints, voice transcription, and generative image creation in one API.',
    icon: Eye,
    badge: 'MULTIMODAL',
    models: [
      { name: 'GPT-4o Vision', tag: 'High-Res OCR', price: '$2.50 / $10.00' },
      { name: 'Gemini 1.5 Pro', tag: 'Audio & Video Ingest', price: '$1.25 / $5.00' },
      { name: 'Whisper & DALL-E 3', tag: 'Audio / Image', price: 'Per Request / Min' },
    ],
    useCases: ['Document parsing', 'Voice assistants', 'Video analysis', 'UI mockup to code'],
  },
  {
    id: 'embeddings-rag',
    title: 'Vector Embeddings & Search',
    subtitle: 'Semantic search, RAG retrieval & reranking',
    description: 'Dense vector representations and neural rerankers optimized for enterprise knowledge bases, semantic matching, and high-dimensional search.',
    icon: Database,
    badge: 'EMBEDDINGS',
    models: [
      { name: 'text-embedding-3-large', tag: '3072 dims', price: '$0.13 / 1M' },
      { name: 'text-embedding-3-small', tag: '1536 dims', price: '$0.02 / 1M' },
      { name: 'bge-large-en-v1.5', tag: 'Dense Retrieval', price: '$0.05 / 1M' },
    ],
    useCases: ['Enterprise RAG', 'Hybrid search', 'Document similarity', 'Recommendation feeds'],
  },
  {
    id: 'long-context',
    title: 'Massive Context Windows',
    subtitle: '128k to 2 Million token context capacities',
    description: 'Feed whole code repositories, lengthy legal contracts, books, and large datasets directly into prompt memory without chunking fragmentation.',
    icon: FileText,
    badge: '2M_CONTEXT',
    models: [
      { name: 'Gemini 1.5 Pro (2M)', tag: '2,000,000 Tokens', price: '$1.25 / $5.00' },
      { name: 'Claude 3.5 Sonnet (200k)', tag: '200,000 Tokens', price: '$3.00 / $15.00' },
      { name: 'GPT-4o (128k)', tag: '128,000 Tokens', price: '$2.50 / $10.00' },
    ],
    useCases: ['Codebase refactoring', 'Legal brief analysis', 'Full book processing', 'Multi-hour transcripts'],
  },
]

export function Collections() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Compass className='size-3.5' />
            <span>// {t('CURATED MODEL DIRECTORY')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Explore Model Collections')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Discover the best AI foundation models hand-picked and organized for specific engineering and business use cases.'
            )}
          </p>
        </div>

        {/* Collections Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {COLLECTIONS_DATA.map((col) => {
            const Icon = col.icon
            return (
              <div
                key={col.id}
                className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 command-corner hover-tech-card shadow-lg'
              >
                <div>
                  <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
                    <span className='rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20'>
                      [{col.badge}]
                    </span>
                  </div>

                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary shadow-inner'>
                      <Icon className='size-5' />
                    </div>
                    <div>
                      <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                        {col.title}
                      </h3>
                      <p className='text-[11px] text-muted-foreground'>
                        {col.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className='text-xs text-muted-foreground leading-relaxed my-4'>
                    {col.description}
                  </p>

                  {/* Models list */}
                  <div className='space-y-2 font-mono text-xs'>
                    <div className='text-[10px] font-semibold text-foreground/80 uppercase tracking-wider'>
                      // {t('Featured Models')}:
                    </div>
                    {col.models.map((m) => (
                      <div
                        key={m.name}
                        className='flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-2.5 py-1.5 text-[11px]'
                      >
                        <span className='font-semibold text-foreground/90'>
                          {m.name}
                        </span>
                        <span className='text-[10px] text-muted-foreground'>
                          {m.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer link */}
                <div className='mt-6 pt-4 border-t border-border/60'>
                  <Link
                    to='/pricing'
                    className='inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary hover:underline'
                  >
                    <span>{t('View in Pricing Explorer')}</span>
                    <ArrowRight className='size-3.5' />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </PublicLayout>
  )
}

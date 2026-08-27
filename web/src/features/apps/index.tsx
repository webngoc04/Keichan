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
  AppWindow,
  ArrowUpRight,
  Terminal,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AppItem {
  id: string
  name: string
  category: 'ide' | 'client' | 'framework'
  description: string
  iconText: string
  tag: string
  url: string
  setupGuide: string
  featured?: boolean
}

const APPS_DATA: AppItem[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'ide',
    description: 'The AI-first Code Editor built for pair-programming and codebase reasoning.',
    iconText: 'CR',
    tag: 'IDE & Coding',
    url: 'https://cursor.com',
    setupGuide: 'Settings > Models > OpenAI API Key & Override Base URL',
    featured: true,
  },
  {
    id: 'cline',
    name: 'Cline / Roo Code',
    category: 'ide',
    description: 'Autonomous coding agent in VS Code that can create, edit and execute commands.',
    iconText: 'CL',
    tag: 'VS Code Agent',
    url: 'https://github.com/cline/cline',
    setupGuide: 'Provider: OpenAI Compatible > Base URL: /v1',
    featured: true,
  },
  {
    id: 'cherry-studio',
    name: 'Cherry Studio',
    category: 'client',
    description: 'Multi-model desktop client with support for 300+ LLMs, web search, and RAG.',
    iconText: 'CS',
    tag: 'Desktop Client',
    url: 'https://cherry-ai.com',
    setupGuide: 'Settings > Provider > Add Custom API Server',
    featured: true,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    category: 'ide',
    description: 'Anthropic agentic CLI coding tool operating directly in terminal workflows.',
    iconText: 'CC',
    tag: 'Terminal CLI',
    url: 'https://docs.anthropic.com',
    setupGuide: 'ANTHROPIC_BASE_URL=<your_gateway_url>/v1',
  },
  {
    id: 'chatbox',
    name: 'Chatbox AI',
    category: 'client',
    description: 'Clean, open-source desktop AI client for macOS, Windows, Linux, iOS & Android.',
    iconText: 'CB',
    tag: 'Cross-Platform',
    url: 'https://chatboxai.app',
    setupGuide: 'Settings > Model Provider > OpenAI API (Custom Host)',
  },
  {
    id: 'opencat',
    name: 'OpenCat',
    category: 'client',
    description: 'Native macOS / iOS AI client with keyboard shortcuts, iCloud sync, and widgets.',
    iconText: 'OC',
    tag: 'Native Apple',
    url: 'https://opencat.app',
    setupGuide: 'Settings > Custom API Domain',
  },
  {
    id: 'librechat',
    name: 'LibreChat',
    category: 'client',
    description: 'Enhanced ChatGPT clone with artifacts, code execution, search & preset sharing.',
    iconText: 'LC',
    tag: 'Web Platform',
    url: 'https://librechat.ai',
    setupGuide: 'librechat.yaml > custom endpoints configuration',
  },
  {
    id: 'nextchat',
    name: 'NextChat (ChatGPT-Next-Web)',
    category: 'client',
    description: 'One-click deploy private web client with rich prompt templates and mask presets.',
    iconText: 'NC',
    tag: 'Web Client',
    url: 'https://nextchat.dev',
    setupGuide: 'BASE_URL environment variable or in-app custom endpoint',
  },
  {
    id: 'langchain',
    name: 'LangChain / LangGraph',
    category: 'framework',
    description: 'Standard framework for building context-aware reasoning applications & agent graphs.',
    iconText: 'LC',
    tag: 'Python / TS SDK',
    url: 'https://langchain.com',
    setupGuide: 'ChatOpenAI(openai_api_base="<gateway_url>/v1")',
  },
  {
    id: 'llamaindex',
    name: 'LlamaIndex',
    category: 'framework',
    description: 'Data framework for LLM-based RAG knowledge retrieval and vector indexing.',
    iconText: 'LI',
    tag: 'RAG Framework',
    url: 'https://llamaindex.ai',
    setupGuide: 'OpenAI(api_base="<gateway_url>/v1")',
  },
  {
    id: 'vercel-ai',
    name: 'Vercel AI SDK',
    category: 'framework',
    description: 'TypeScript toolkit for building reactive AI web applications with streaming.',
    iconText: 'VAI',
    tag: 'TypeScript SDK',
    url: 'https://sdk.vercel.ai',
    setupGuide: 'createOpenAI({ baseURL: "<gateway_url>/v1" })',
  },
  {
    id: 'aider',
    name: 'Aider',
    category: 'ide',
    description: 'AI pair programming in your terminal directly integrated with git repos.',
    iconText: 'AD',
    tag: 'CLI Coding',
    url: 'https://aider.chat',
    setupGuide: 'OPENAI_API_BASE=<gateway_url>/v1 aider',
  },
]

export function Apps() {
  const { t } = useTranslation()
  const [activeCategory, setActiveCategory] = useState<'all' | 'ide' | 'client' | 'framework'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = APPS_DATA.filter((app) => {
    const matchCat = activeCategory === 'all' || app.category === activeCategory
    const matchQuery =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tag.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <AppWindow className='size-3.5' />
            <span>// {t('ECOSYSTEM & INTEGRATIONS')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Works With Everything')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Connect standard OpenAI-compatible endpoints to your favorite IDEs, CLI tools, chat clients, and agent frameworks.'
            )}
          </p>
        </div>

        {/* Filters */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex flex-wrap items-center gap-1.5'>
            {[
              { id: 'all', label: t('All Tools & Apps') },
              { id: 'ide', label: t('IDEs & Coding Agents') },
              { id: 'client', label: t('Chat Clients & UI') },
              { id: 'framework', label: t('Developer Frameworks') },
            ].map((tab) => (
              <button
                type='button'
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
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
            placeholder={t('Search apps & integrations...')}
            className='h-9 w-full sm:w-64 text-xs font-mono'
          />
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((app) => (
            <div
              key={app.id}
              className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 command-corner hover-tech-card shadow-lg'
            >
              <div>
                <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
                  <span className='rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20'>
                    {t(app.tag)}
                  </span>
                  <a
                    href={app.url}
                    target='_blank'
                    rel='noreferrer'
                    className='text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[11px]'
                  >
                    <span>{t('Website')}</span>
                    <ArrowUpRight className='size-3' />
                  </a>
                </div>

                <div className='flex items-center gap-3 mb-3'>
                  <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 font-mono font-bold text-primary text-sm shadow-inner'>
                    {app.iconText}
                  </div>
                  <div>
                    <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                      {app.name}
                    </h3>
                  </div>
                </div>

                <p className='text-xs text-muted-foreground leading-relaxed mb-4'>
                  {t(app.description)}
                </p>
              </div>

              {/* Setup Snippet */}
              <div className='mt-2 rounded-xl border border-border/60 bg-muted/20 p-2.5 font-mono text-[11px] text-muted-foreground'>
                <div className='text-[10px] font-semibold text-foreground/80 mb-1 flex items-center gap-1'>
                  <Terminal className='size-3 text-primary' />
                  <span>// {t('Configuration')}:</span>
                </div>
                <div className='truncate text-foreground/90 font-medium'>
                  {app.setupGuide}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Architecture Banner */}
        <div className='mt-16 rounded-3xl border border-border/80 bg-card/60 p-8 backdrop-blur-md command-corner shadow-xl'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div className='space-y-2 max-w-xl'>
              <div className='inline-flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-wider font-semibold'>
                <Zap className='size-3.5' />
                <span>// {t('UNIVERSAL COMPATIBILITY')}</span>
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-foreground'>
                {t('Need to connect a custom tool or script?')}
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                {t(
                  'Any tool supporting OpenAI API format works out of the box. Just set your baseURL to this gateway and generate an API key from the dashboard.'
                )}
              </p>
            </div>
            <div className='flex items-center gap-3 shrink-0'>
              <Button
                className='rounded-full text-xs font-mono'
                render={<Link to='/keys' />}
              >
                {t('Create API Key')}
              </Button>
              <Button
                variant='outline'
                className='rounded-full text-xs font-mono'
                render={<Link to='/docs' />}
              >
                {t('Read Docs')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

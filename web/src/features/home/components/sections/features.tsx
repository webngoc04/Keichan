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
  Zap,
  Shield,
  Globe,
  Code,
  Check,
  Copy,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { GlitchText } from '@/components/cyber/glitch-text'
import { ScrambleText } from '@/components/cyber/scramble-text'
import { useStatus } from '@/hooks/use-status'

interface FeaturesProps {
  className?: string
}

type SdkLang = 'cursor' | 'stream' | 'sdk'

export function Features(_props: FeaturesProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const [selectedLang, setSelectedLang] = useState<SdkLang>('cursor')
  const [codeCopied, setCodeCopied] = useState(false)

  const serverAddress =
    (status?.server_address as string | undefined)?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://api.openai.com')
  const apiBaseUrl = `${serverAddress}/v1`
  const apiHost = serverAddress.replace(/^https?:\/\//, '')

  const snippets: Record<SdkLang, { code: string; label: string }> = useMemo(
    () => ({
      cursor: {
        label: 'Cursor / Cline',
        code: `{
  "api_type": "openai",
  "base_url": "${apiBaseUrl}",
  "api_key": "sk-••••••••••••••••",
  "models": [
    "deepseek-r1",
    "claude-3-5-sonnet",
    "gemini-2.5-pro",
    "gpt-4o"
  ]
}`,
      },
      stream: {
        label: 'Protocol SSE Stream',
        code: `POST /v1/chat/completions HTTP/1.1
Host: ${apiHost}
Authorization: Bearer sk-••••••••••••••••
Content-Type: application/json

< HTTP/1.1 200 OK (SSE Stream Active)
< data: {"id":"cmpl-01","choices":[{"delta":{"content":"Connected."}}]}
< data: {"id":"cmpl-01","choices":[{"delta":{"content":" Ready."}}]}
< data: [DONE]`,
      },
      sdk: {
        label: 'Unified AI SDK',
        code: `import { createOpenAI } from '@ai-sdk/openai';

export const gateway = createOpenAI({
  baseURL: '${apiBaseUrl}',
  apiKey: process.env.KEICHAN_API_KEY,
});

// Single client automatically routes to 50+ AI providers`,
      },
    }),
    [apiBaseUrl, apiHost]
  )

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippets[selectedLang].code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <section className='relative z-10 px-4 py-16 sm:px-6 md:py-24 max-w-[1280px] mx-auto'>
      {/* Section Header */}
      <AnimateInView className='mb-8 max-w-xl'>
        <div className='mb-2 inline-flex items-center gap-2 font-mono text-xs text-primary font-medium tracking-wider uppercase'>
          <span className='pulse-radar-dot size-1.5 rounded-full bg-primary inline-block' />
          <ScrambleText text='// 01_SYSTEM_TOPOLOGY' speed={25} />
        </div>
        <h2 className='text-2xl sm:text-3xl font-bold tracking-tight leading-tight font-mono'>
          <GlitchText as='span'>{t('REVERSE PROXY MATRIX')}</GlitchText>
          <br />
          <span className='bg-gradient-to-r from-cyan-400 via-primary to-violet-400 bg-clip-text text-transparent matrix-stream-glow'>
            {t('DYNAMIC ROUTING INFRASTRUCTURE')}
          </span>
        </h2>
      </AnimateInView>

      {/* Balanced 2x2 High-Tech Bento Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Card 01: Unified Multi-Protocol Gateway */}
        <AnimateInView
          delay={0}
          animation='fade-up'
          className='rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xs command-corner hud-corner hover-tech-card flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
              <span className='text-primary font-bold'>01</span>
              <span className='text-muted-foreground text-[10px] tracking-wider uppercase font-mono'>
                <ScrambleText text='[ROUTER_PIPELINE]' speed={30} />
              </span>
            </div>

            <div className='flex items-center gap-2.5 mb-2'>
              <div className='flex size-7 items-center justify-center rounded-lg border border-border/80 bg-muted/40'>
                <Zap className='size-4 text-primary' />
              </div>
              <h3 className='text-base font-semibold tracking-tight font-mono'>
                {t('Unified API Reverse Proxy')}
              </h3>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed mb-5 font-mono'>
              {t(
                'Standardizes 50+ upstream AI provider channels into a high-concurrency OpenAI-compatible interface with zero protocol translation overhead.'
              )}
            </p>
          </div>

          {/* Unified Contiguous Endpoints Container */}
          <div className='space-y-3 font-mono text-xs'>
            <div className='rounded-xl border border-border/80 bg-background/50 divide-y divide-border/60 overflow-hidden shadow-xs'>
              {[
                { method: 'POST', path: '/v1/chat/completions', desc: t('Chat & Reasoning (DeepSeek-R1, GPT-4o, Claude 3.5, Gemini)') },
                { method: 'POST', path: '/v1/embeddings', desc: t('Vector Representation & RAG pipelines') },
                { method: 'POST', path: '/v1/audio/transcriptions', desc: t('Speech-to-Text & Realtime Voice APIs') },
                { method: 'POST', path: '/v1/images/generations', desc: t('Image Synthesis & Multimodal Generation') },
              ].map((ep) => (
                <div
                  key={ep.path}
                  className='flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 text-xs gap-1 sm:gap-3 hover:bg-primary/5 transition-colors'
                >
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-primary/15 text-primary border border-primary/20'>
                      {ep.method}
                    </span>
                    <span className='font-semibold text-foreground tracking-tight text-[11.5px]'>{ep.path}</span>
                  </div>
                  <span className='text-muted-foreground text-[10.5px] truncate sm:text-right'>
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Supported Upstream Ecosystem */}
            <div className='pt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground'>
              <span className='text-foreground/70 font-semibold mr-1 font-mono'>[{t('UPSTREAM')}]:</span>
              {['OpenAI', 'Anthropic Claude', 'Google Gemini', 'DeepSeek', 'AWS Bedrock', 'Azure OpenAI', 'Vertex AI', 'Groq', 'vLLM', 'Ollama'].map((p) => (
                <span
                  key={p}
                  className='rounded-md border border-border/60 bg-muted/30 px-1.5 py-0.5 text-foreground/80 font-mono text-[10px]'
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </AnimateInView>

        {/* Card 02: Enterprise Security & Governance */}
        <AnimateInView
          delay={80}
          animation='fade-up'
          className='rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xs command-corner hud-corner hover-tech-card flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
              <span className='text-primary font-bold'>02</span>
              <span className='text-muted-foreground text-[10px] tracking-wider uppercase'>
                <ScrambleText text={`[${t('SECURITY')}]`} speed={30} />
              </span>
            </div>

            <div className='flex items-center gap-2.5 mb-2'>
              <div className='flex size-7 items-center justify-center rounded-lg border border-border/80 bg-muted/40'>
                <Shield className='size-4 text-emerald-400' />
              </div>
              <h3 className='text-base font-semibold tracking-tight font-mono'>
                {t('Security & Access Governance')}
              </h3>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed mb-5 font-mono'>
              {t(
                'Granular permission boundaries, cryptographic token isolation, and real-time usage auditing.'
              )}
            </p>
          </div>

          {/* Real Security Feature Architecture Contiguous Container */}
          <div className='rounded-xl border border-border/80 bg-background/50 divide-y divide-border/60 overflow-hidden font-mono text-xs shadow-xs'>
            {[
              { tag: t('PERMISSIONS'), title: t('Granular Scoped API Keys'), desc: t('Bind specific models, expiry dates & quotas per token') },
              { tag: t('NETWORKING'), title: t('Strict CIDR IP Whitelisting'), desc: t('Enforce access boundaries per user or global system') },
              { tag: t('BUDGETING'), title: t('Hard spending quota limits'), desc: t('Prevent runaway costs with automatic threshold cutoffs') },
              { tag: t('AUDITING'), title: t('Full Request Consumption Logs'), desc: t('Zero-loss tracking of token counts, users & channels') },
            ].map((item) => (
              <div
                key={item.tag}
                className='px-3.5 py-2.5 text-left hover:bg-emerald-500/5 transition-colors'
              >
                <div className='flex items-center justify-between text-[10px] text-muted-foreground mb-0.5'>
                  <span className='text-emerald-400 font-semibold'>[{item.tag}]</span>
                </div>
                <div className='font-semibold text-foreground tracking-tight text-[11.5px]'>{item.title}</div>
                <div className='text-[10.5px] text-muted-foreground mt-0.5'>{item.desc}</div>
              </div>
            ))}
          </div>
        </AnimateInView>

        {/* Card 03: Dynamic Smart Failover */}
        <AnimateInView
          delay={160}
          animation='fade-up'
          className='rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xs command-corner hud-corner hover-tech-card flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
              <span className='text-primary font-bold'>03</span>
              <span className='text-muted-foreground text-[10px] tracking-wider uppercase'>
                <ScrambleText text={`[${t('RESILIENCE')}]`} speed={30} />
              </span>
            </div>

            <div className='flex items-center gap-2.5 mb-2'>
              <div className='flex size-7 items-center justify-center rounded-lg border border-border/80 bg-muted/40'>
                <Globe className='size-4 text-violet-400' />
              </div>
              <h3 className='text-base font-semibold tracking-tight font-mono'>
                {t('Smart Routing & Failover')}
              </h3>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed mb-5 font-mono'>
              {t('Automatic unhealthy node eviction, weighted traffic distribution and zero-downtime retries.')}
            </p>
          </div>

          {/* Resilience Architecture Flow Contiguous Container */}
          <div className='rounded-xl border border-border/80 bg-background/50 divide-y divide-border/60 overflow-hidden font-mono text-xs shadow-xs'>
            {[
              { tag: t('ROUTING'), title: t('Weighted Round-Robin'), desc: t('Balance load across multiple accounts & regional endpoints') },
              { tag: t('DETECTION'), title: t('Passive & Active Health Probing'), desc: t('Evict sluggish or 5xx nodes automatically') },
              { tag: t('ISOLATION'), title: t('Circuit Breaker Engine'), desc: t('Prevent cascading timeouts when upstreams degrade') },
              { tag: t('RETRY'), title: t('Zero-Downtime Auto Fallback'), desc: t('Seamlessly switch channels mid-request on error') },
            ].map((step) => (
              <div
                key={step.tag}
                className='px-3.5 py-2.5 text-left hover:bg-violet-500/5 transition-colors'
              >
                <div className='text-[10px] text-violet-400 font-semibold mb-0.5'>
                  [{step.tag}]
                </div>
                <div className='font-semibold text-foreground tracking-tight text-[11.5px]'>{step.title}</div>
                <div className='text-[10.5px] text-muted-foreground mt-0.5'>{step.desc}</div>
              </div>
            ))}
          </div>
        </AnimateInView>

        {/* Card 04: Developer Friendly Integration Interactive Switcher */}
        <AnimateInView
          delay={240}
          animation='fade-up'
          className='rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-7 backdrop-blur-xs command-corner hud-corner hover-tech-card flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
              <span className='text-primary font-bold'>04</span>
              <span className='text-muted-foreground text-[10px] tracking-wider uppercase'>
                <ScrambleText text={`[${t('COMPATIBILITY')}]`} speed={30} />
              </span>
            </div>

            <div className='flex items-center gap-2.5 mb-2'>
              <div className='flex size-7 items-center justify-center rounded-lg border border-border/80 bg-muted/40'>
                <Code className='size-4 text-amber-400' />
              </div>
              <h3 className='text-base font-semibold tracking-tight font-mono'>
                {t('Zero-Code Migration & Compatibility')}
              </h3>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed mb-5 font-mono'>
              {t(
                'Drop-in replacement for any client, SDK, or autonomous agent tool by changing a single base URL.'
              )}
            </p>
          </div>

          {/* Authentic Code Block with Language Tabs */}
          <div className='rounded-xl border border-border/80 bg-background/90 overflow-hidden font-mono text-xs shadow-inner'>
            <div className='flex items-center justify-between gap-2 border-b border-border/80 bg-muted/30 px-3 py-2 flex-nowrap overflow-x-auto no-scrollbar'>
              <div className='flex items-center gap-1 shrink-0 flex-nowrap'>
                {(['cursor', 'stream', 'sdk'] as const).map((lang) => (
                  <button
                    type='button'
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                      selectedLang === lang
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {snippets[lang].label}
                  </button>
                ))}
              </div>

              <div className='flex items-center gap-2 shrink-0 flex-nowrap whitespace-nowrap ml-auto'>
                <span className='hidden sm:inline-block text-[10px] text-emerald-400 font-semibold shrink-0'>
                  ✓ {t('100% OPENAI COMPATIBLE')}
                </span>
                <button
                  type='button'
                  onClick={handleCopyCode}
                  className='inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-border/60 rounded px-2 py-0.5 bg-muted/40 hover:bg-muted transition-colors shrink-0 whitespace-nowrap'
                  aria-label={t('Copy SDK snippet')}
                >
                  {codeCopied ? (
                    <>
                      <Check className='size-3 text-emerald-400' />
                      <span className='text-emerald-400'>{t('Copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className='size-3' />
                      <span>{t('Copy')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className='p-3.5 text-[11px] leading-relaxed overflow-x-auto text-foreground/90 bg-black/40'>
              <pre className='whitespace-pre font-mono'>
                <code>{snippets[selectedLang].code}</code>
              </pre>
            </div>

            {/* Ecosystem Compatibility Row */}
            <div className='border-t border-border/60 bg-muted/20 px-3.5 py-2 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground'>
              <span className='text-foreground/70 font-semibold font-mono whitespace-nowrap'>{t('WORKS WITH:')}</span>
              {['Cursor', 'Cline', 'Roo Code', 'Open WebUI', 'Dify', 'NextChat', 'Cherry Studio', 'LangChain'].map((tool) => (
                <span key={tool} className='text-foreground/80 font-mono text-[10px] whitespace-nowrap'>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </AnimateInView>
      </div>
    </section>
  )
}

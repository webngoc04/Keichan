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
  BookOpen,
  Check,
  Copy,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { GlitchText } from '@/components/cyber/glitch-text'
import { ScrambleText } from '@/components/cyber/scramble-text'
import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CODE_EXAMPLES = {
  curl: `curl https://api.yourdomain.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "deepseek-r1",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain quantum superposition in 2 sentences."}
    ],
    "stream": true
  }'`,
  python: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.yourdomain.com/v1",
    api_key="YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[
        {"role": "system", "content": "You are an expert software engineer."},
        {"role": "user", "content": "Write a high-performance Go rate limiter."}
    ],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`,
  javascript: `import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.yourdomain.com/v1',
  apiKey: 'YOUR_API_KEY',
});

async function main() {
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Explain zero-knowledge proofs.' }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || '');
  }
}

main();`,
}

export function Docs() {
  const { t } = useTranslation()
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'javascript'>('python')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeLang])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <BookOpen className='size-3.5' />
            <ScrambleText text={`// ${t('DEVELOPER DOCUMENTATION')}`} speed={25} />
          </div>
          <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground font-mono leading-tight'>
            <GlitchText as='span'>{t('API Reference & Quickstart')}</GlitchText>
          </h1>
          <p className='mt-4 max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed font-mono'>
            {t(
              '100% OpenAI API compatible. Drop-in replacement for existing applications, libraries, and SDKs.'
            )}
          </p>
        </div>

        {/* Code Showcase Card */}
        <div className='mb-14 overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md command-corner hud-corner shadow-xl'>
          <div className='flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-3'>
            <div className='flex items-center gap-2 font-mono text-xs'>
              {(['python', 'javascript', 'curl'] as const).map((lang) => (
                <button
                  type='button'
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-medium transition-colors font-mono',
                    activeLang === lang
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleCopy}
              className='h-8 gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground'
            >
              {copied ? (
                <>
                  <Check className='size-3.5 text-emerald-400' />
                  <span>{t('Copied')}</span>
                </>
              ) : (
                <>
                  <Copy className='size-3.5' />
                  <span>{t('Copy Code')}</span>
                </>
              )}
            </Button>
          </div>

          <pre className='overflow-x-auto p-5 font-mono text-xs sm:text-[13px] leading-relaxed text-foreground/90 bg-black/40'>
            <code>{CODE_EXAMPLES[activeLang]}</code>
          </pre>
        </div>

        {/* Endpoint Reference Cards */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 font-mono text-sm font-bold text-foreground'>
            <span className='pulse-radar-dot size-1.5 rounded-full bg-primary inline-block' />
            <span>// {t('Supported Endpoints')}</span>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[
              {
                method: 'POST',
                path: '/v1/chat/completions',
                title: t('Chat Completions & Streaming'),
                desc: t('Standard unified chat interface supporting 50+ providers, streaming, tool use, and JSON mode.'),
              },
              {
                method: 'POST',
                path: '/v1/embeddings',
                title: t('Vector Embeddings'),
                desc: t('Compute dense vector representations for RAG document chunking and semantic search.'),
              },
              {
                method: 'POST',
                path: '/v1/images/generations',
                title: t('Image Generation (DALL-E / FLUX)'),
                desc: t('Generate high-resolution visual assets with prompt modifiers and resolution scaling.'),
              },
              {
                method: 'GET',
                path: '/v1/models',
                title: t('Models Directory'),
                desc: t('List all active models, pricing tiers, and capabilities dynamically mapped to your API key.'),
              },
            ].map((ep) => (
              <div
                key={`${ep.method}-${ep.path}`}
                className='rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-xs command-corner hud-corner hover-tech-card font-mono'
              >
                <div className='flex items-center gap-2 mb-2 font-mono text-xs'>
                  <span className='rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400 border border-emerald-500/20'>
                    {ep.method}
                  </span>
                  <span className='font-bold text-foreground'>{ep.path}</span>
                </div>
                <h3 className='text-sm font-semibold text-foreground mb-1 tracking-tight font-mono'>
                  {ep.title}
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed font-mono'>
                  {ep.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

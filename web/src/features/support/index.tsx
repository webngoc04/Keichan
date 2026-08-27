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
  ArrowUpRight,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Send,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'

export function Support() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <LifeBuoy className='size-3.5' />
            <span>// {t('HELP & SUPPORT CENTER')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('How can we help you?')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Get technical support, report an incident, or connect with our developer community.'
            )}
          </p>
        </div>

        {/* Channels Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-16'>
          {[
            {
              icon: MessageSquare,
              title: t('Discord Community'),
              desc: t('Chat with fellow developers, share integrations, and get quick technical help.'),
              linkText: t('Join Discord'),
              url: 'https://discord.gg',
            },
            {
              icon: Send,
              title: t('Telegram Channel & Group'),
              desc: t('Instant uptime announcements, model release broadcasts, and direct chat.'),
              linkText: t('Join Telegram'),
              url: 'https://t.me',
            },
            {
              icon: Mail,
              title: t('Direct Email Support'),
              desc: t('Enterprise inquiries, billing questions, and confidential vulnerability reports.'),
              linkText: t('Contact Team'),
              url: 'mailto:support@example.com',
            },
          ].map((ch) => {
            const Icon = ch.icon
            return (
              <div
                key={ch.title}
                className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md command-corner hover-tech-card shadow-lg'
              >
                <div>
                  <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary mb-4 shadow-inner'>
                    <Icon className='size-5' />
                  </div>
                  <h3 className='text-base font-bold text-foreground mb-2'>
                    {ch.title}
                  </h3>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    {ch.desc}
                  </p>
                </div>
                <div className='mt-6 pt-4 border-t border-border/60'>
                  <a
                    href={ch.url}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:underline'
                  >
                    <span>{ch.linkText}</span>
                    <ArrowUpRight className='size-3.5' />
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className='max-w-3xl mx-auto space-y-4'>
          <h2 className='text-xl font-bold text-foreground font-mono mb-4 text-center'>
            // {t('Frequently Asked Questions')}
          </h2>

          {[
            {
              q: t('How does OpenAI compatibility work?'),
              a: t('Any application using the OpenAI SDK or HTTP API only needs its baseURL pointed to this gateway with an API key generated from your dashboard.'),
            },
            {
              q: t('What happens if an upstream provider goes down?'),
              a: t('Our gateway detects error responses and latency spikes in real-time and immediately reroutes traffic to alternate configured channels with zero interruption.'),
            },
            {
              q: t('How is billing calculated?'),
              a: t('Usage is calculated strictly per input/output token based on transparent rates shown in the Pricing tab. You only pay for what you consume.'),
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className='rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-md command-corner'
            >
              <h4 className='text-sm font-bold text-foreground mb-1.5 flex items-center gap-2'>
                <HelpCircle className='size-4 text-primary shrink-0' />
                <span>{faq.q}</span>
              </h4>
              <p className='text-xs text-muted-foreground leading-relaxed pl-6'>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

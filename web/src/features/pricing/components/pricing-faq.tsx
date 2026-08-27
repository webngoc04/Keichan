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
import { useTranslation } from 'react-i18next'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function PricingFAQ() {
  const { t } = useTranslation()

  const faqItems = [
    {
      question: t('How does Pay As You Go token billing work?'),
      answer: t(
        'With Pay As You Go, you top up funds into your wallet balance. Each API request deducts quota in real time based on the exact input and output tokens (or image/audio units) used. There are no monthly recurring fees or hidden charges.'
      ),
    },
    {
      question: t('Do my purchased credits or quota expire?'),
      answer: t(
        'No, purchased credits on the Pay As You Go tier do not expire. You can consume them at your own pace without worrying about monthly resets or loss of unused balance.'
      ),
    },
    {
      question: t('Can I switch from Free to Pay As You Go or Enterprise?'),
      answer: t(
        'Yes! You can upgrade instantly to Pay As You Go by adding balance to your wallet in the dashboard. If your team requires dedicated upstream channels, custom SLA, or corporate billing contracts, you can contact our enterprise team at any time.'
      ),
    },
    {
      question: t('How are different AI models priced?'),
      answer: t(
        'Each upstream model (OpenAI, Claude, Gemini, DeepSeek, etc.) has its own per-token pricing ratio matching official upstream or discounted rates. You can inspect exact per-million token rates anytime in the Model Square.'
      ),
    },
    {
      question: t('What payment methods are supported?'),
      answer: t(
        'We support multiple convenient payment options including online top-up, digital payments, redemption cards/vouchers, and direct corporate wire transfer for Enterprise contracts.'
      ),
    },
  ]

  return (
    <div className='mx-auto max-w-3xl'>
      <div className='mb-8 text-center'>
        <div className='mb-3 inline-flex items-center gap-2 font-mono text-xs text-primary font-medium tracking-wider uppercase'>
          <span>// {t('QUESTIONS & ANSWERS')}</span>
        </div>
        <h3 className='text-fluid-h3 font-bold tracking-tight'>
          {t('Frequently Asked Questions')}
        </h3>
        <p className='text-muted-foreground mt-2 text-xs sm:text-sm'>
          {t('Everything you need to know about billing, quotas, and service tiers.')}
        </p>
      </div>

      <div className='border-border/80 bg-card/60 rounded-3xl border p-4 sm:p-6 backdrop-blur-md command-corner shadow-xl'>
        <Accordion className='w-full'>
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={`faq-${item.question}`}>
              <AccordionTrigger className='text-sm sm:text-base font-medium py-4 text-foreground hover:no-underline hover:text-primary transition-colors'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground text-xs sm:text-sm leading-relaxed pb-4'>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

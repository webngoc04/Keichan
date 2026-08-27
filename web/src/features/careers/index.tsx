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
  Briefcase,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'

export function Careers() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Briefcase className='size-3.5' />
            <span>// {t('CAREERS & OPPORTUNITIES')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Build the Next-Gen AI Gateway')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'We are a globally distributed team building mission-critical AI routing, developer tools, and high-concurrency infrastructure.'
            )}
          </p>
        </div>

        {/* Roles List */}
        <div className='space-y-4 max-w-4xl mx-auto'>
          {[
            {
              title: t('Distributed Systems / Go Backend Engineer'),
              dept: 'Infrastructure',
              loc: 'Remote / Global',
              type: 'Full-Time',
              desc: t(
                'Scale high-throughput Go proxy gateways, optimize memory allocs, and build distributed circuit breakers for millions of requests/day.'
              ),
            },
            {
              title: t('AI Routing & Model Optimization Engineer'),
              dept: 'Inference',
              loc: 'Remote / Global',
              type: 'Full-Time',
              desc: t(
                'Design dynamic token routing algorithms, speculative probe execution, and prompt deduplication caches across 40+ upstream networks.'
              ),
            },
            {
              title: t('Frontend Platform & Design Engineer'),
              dept: 'Product',
              loc: 'Remote / Global',
              type: 'Full-Time',
              desc: t(
                'Craft developer-grade web interfaces with React, TypeScript, Tailwind, and Base UI with obsessive attention to dark-tech aesthetics.'
              ),
            },
           ].map((role) => (
            <div
              key={role.title}
              className='group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md command-corner hover-tech-card shadow-lg'
            >
              <div className='space-y-1.5'>
                <div className='flex items-center gap-2 font-mono text-xs text-muted-foreground'>
                  <span className='rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary border border-primary/20'>
                    {role.dept}
                  </span>
                  <span>·</span>
                  <span>{role.loc}</span>
                  <span>·</span>
                  <span>{role.type}</span>
                </div>
                <h3 className='text-base font-bold text-foreground group-hover:text-primary transition-colors'>
                  {role.title}
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed max-w-2xl'>
                  {role.desc}
                </p>
              </div>

              <div className='shrink-0'>
                <Button
                  variant='outline'
                  className='rounded-full text-xs font-mono w-full sm:w-auto'
                  render={<Link to='/support' />}
                >
                  {t('Apply via Support')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

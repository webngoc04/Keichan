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
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  ArrowRight,
  Boxes,
  GitBranch,
  Network,
  Receipt,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { RichContent } from '@/components/rich-content'
import { Skeleton } from '@/components/ui/skeleton'
import { isHttpUrl, isLikelyHtml } from '@/lib/content-format'

import { getAboutContent } from './api'

const KEICHAN_REPO = 'https://github.com/webngoc04/Keichan'
const NEW_API_REPO = 'https://github.com/QuantumNous/new-api'
const QUANTUMNOUS_REPO = 'https://github.com/QuantumNous'
const ONE_API_REPO = 'https://github.com/songquanpeng/one-api'
const JUSTSONG_REPO = 'https://github.com/songquanpeng'
const LICENSE_URL = `${KEICHAN_REPO}/blob/main/LICENSE`

function SectionTag(props: { children: React.ReactNode }) {
  return (
    <span className='font-mono text-[11px] uppercase tracking-[0.2em] text-primary'>
      {props.children}
    </span>
  )
}

function StatCard(props: { value: string; label: string }) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-1 rounded-xl border border-border/60 bg-card/40 px-5 py-4 command-corner'>
      <span className='font-mono text-xl font-bold text-foreground md:text-2xl'>
        {props.value}
      </span>
      <span className='text-xs text-muted-foreground'>{t(props.label)}</span>
    </div>
  )
}

function CapabilityCard(props: {
  icon: React.ReactNode
  titleKey: string
  descKey: string
}) {
  const { t } = useTranslation()
  return (
    <div className='group rounded-2xl border border-border/60 bg-card/40 p-5 command-corner transition-colors hover:border-primary/50'>
      <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background text-primary'>
        {props.icon}
      </div>
      <h3 className='mb-1 text-base font-semibold text-foreground'>
        {t(props.titleKey)}
      </h3>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        {t(props.descKey)}
      </p>
    </div>
  )
}

function ValueItem(props: { titleKey: string; descKey: string }) {
  const { t } = useTranslation()
  return (
    <div className='space-y-1.5'>
      <h3 className='text-sm font-semibold text-foreground'>
        {t(props.titleKey)}
      </h3>
      <p className='text-sm leading-relaxed text-muted-foreground'>
        {t(props.descKey)}
      </p>
    </div>
  )
}

const capabilities = [
  {
    icon: <Network className='h-5 w-5' />,
    titleKey: 'about.cap.unified.title',
    descKey: 'about.cap.unified.desc',
  },
  {
    icon: <Server className='h-5 w-5' />,
    titleKey: 'about.cap.routing.title',
    descKey: 'about.cap.routing.desc',
  },
  {
    icon: <Receipt className='h-5 w-5' />,
    titleKey: 'about.cap.billing.title',
    descKey: 'about.cap.billing.desc',
  },
  {
    icon: <ShieldCheck className='h-5 w-5' />,
    titleKey: 'about.cap.ratelimit.title',
    descKey: 'about.cap.ratelimit.desc',
  },
  {
    icon: <Activity className='h-5 w-5' />,
    titleKey: 'about.cap.observability.title',
    descKey: 'about.cap.observability.desc',
  },
  {
    icon: <Boxes className='h-5 w-5' />,
    titleKey: 'about.cap.selfhosted.title',
    descKey: 'about.cap.selfhosted.desc',
  },
]

const values = [
  {
    titleKey: 'about.value.devfirst.title',
    descKey: 'about.value.devfirst.desc',
  },
  {
    titleKey: 'about.value.transparency.title',
    descKey: 'about.value.transparency.desc',
  },
  {
    titleKey: 'about.value.privacy.title',
    descKey: 'about.value.privacy.desc',
  },
  {
    titleKey: 'about.value.community.title',
    descKey: 'about.value.community.desc',
  },
]

function AboutMarketing() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <PublicLayout>
      <div className='mx-auto max-w-[1220px] space-y-10 py-8 md:space-y-14 md:py-10'>
        {/* Hero */}
        <section className='command-corner relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md md:rounded-3xl'>
          <div className='command-grid-bg pointer-events-none absolute inset-0 opacity-30' />
          <div className='flex items-center justify-between border-b border-border/80 bg-muted/20 px-4 py-2.5 font-mono text-[11px] text-muted-foreground'>
            <span>● {t('about.hero.status')}</span>
            <span>[v0.0.0]</span>
          </div>
          <div className='relative space-y-6 px-5 py-10 md:px-12 md:py-16'>
            <SectionTag>// 00 MISSION</SectionTag>
             <h1 className='max-w-3xl text-[clamp(1.75rem,1rem+3.2vw,3rem)] font-bold leading-tight text-foreground'>
               {t('about.hero.title')}
             </h1>
             <p className='max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
               {t('about.hero.subtitle')}
             </p>
             <div className='flex flex-wrap gap-3'>
               <a
                 href={KEICHAN_REPO}
                 target='_blank'
                 rel='noopener noreferrer'
                 className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-md hover:opacity-90'
               >
                <GitBranch className='h-4 w-4' />
                {t('about.cta.github')}
              </a>
              <Link
                to='/sign-up'
                className='inline-flex h-10 items-center gap-2 rounded-full border border-border/80 px-5 font-mono text-xs hover:border-foreground/40'
              >
                {t('about.cta.start')}
                <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className='grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3'>
          <StatCard value='40+' label='about.stats.providers' />
          <StatCard value='1' label='about.stats.unified' />
          <StatCard value='99.9%' label='about.stats.uptime' />
          <StatCard value='AGPL' label='about.stats.license' />
        </section>

        {/* Capabilities */}
        <section className='space-y-6'>
          <div className='space-y-2'>
            <SectionTag>// 01 CAPABILITIES</SectionTag>
            <h2 className='text-[clamp(1.5rem,1.1rem+1.4vw,1.875rem)] font-bold text-foreground'>
              {t('about.capabilities.title')}
            </h2>
            <p className='max-w-2xl text-muted-foreground'>
              {t('about.capabilities.subtitle')}
            </p>
          </div>
          <div className='grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]'>
            {capabilities.map((capability) => (
              <CapabilityCard
                key={capability.titleKey}
                icon={capability.icon}
                titleKey={capability.titleKey}
                descKey={capability.descKey}
              />
            ))}
          </div>
        </section>

        {/* Values */}
        <section className='space-y-6'>
          <div className='space-y-2'>
            <SectionTag>// 02 PRINCIPLES</SectionTag>
            <h2 className='text-[clamp(1.5rem,1.1rem+1.4vw,1.875rem)] font-bold text-foreground'>
              {t('about.values.title')}
            </h2>
          </div>
          <div className='grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]'>
            {values.map((value) => (
              <ValueItem
                key={value.titleKey}
                titleKey={value.titleKey}
                descKey={value.descKey}
              />
            ))}
          </div>
        </section>

        {/* Open source */}
        <section className='command-corner rounded-2xl border border-border/80 bg-card/40 p-8'>
          <div className='space-y-3'>
            <SectionTag>// 03 OPEN SOURCE</SectionTag>
            <h2 className='text-[clamp(1.5rem,1.1rem+1.4vw,1.875rem)] font-bold text-foreground'>
              {t('about.oss.title')}
            </h2>
            <p className='max-w-2xl text-muted-foreground'>
              {t('about.oss.body')}
            </p>
            <div className='flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm'>
              <a
                href={KEICHAN_REPO}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                {t('about.oss.repo')}
              </a>
              <a
                href={LICENSE_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                {t('about.oss.license')}
              </a>
              <a
                href={ONE_API_REPO}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                {t('One API')}
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='command-corner relative overflow-hidden rounded-2xl border border-primary/40 bg-card/40 p-8 md:p-12'>
          <div className='space-y-4 text-center'>
            <h2 className='mx-auto max-w-2xl text-[clamp(1.5rem,1.1rem+1.8vw,2.25rem)] font-bold text-foreground'>
              {t('about.cta.title')}
            </h2>
            <p className='mx-auto max-w-xl text-muted-foreground'>
              {t('about.cta.subtitle')}
            </p>
            <div className='flex justify-center gap-3 pt-2'>
              <Link
                to='/sign-up'
                className='inline-flex h-10 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-md hover:opacity-90'
              >
                {t('about.cta.deploy')}
                <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          </div>
        </section>

        {/* Attribution */}
        <footer className='space-y-2 border-t border-border/60 pt-6 text-sm text-muted-foreground'>
          <p className='break-words'>
            {t('about.footer.repoLabel')}{' '}
            <a
              href={KEICHAN_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='break-all text-primary hover:underline'
            >
              {t('about.footer.repoUrl')}
            </a>
          </p>
          <p className='break-words'>
            <a
              href={KEICHAN_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('about.footer.product')}
            </a>{' '}
            © {currentYear} ·{' '}
            {t('about.footer.basedOn')}{' '}
            <a
              href={NEW_API_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('New API')}
            </a>{' '}
            (
            <a
              href={QUANTUMNOUS_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('QuantumNous')}
            </a>
            ) ·{' '}
            {t('about.footer.basedOn')}{' '}
            <a
              href={ONE_API_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('One API')}
            </a>{' '}
            (
            <a
              href={JUSTSONG_REPO}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('JustSong')}
            </a>
            )
          </p>
          <p>
            {t('This project must be used in compliance with the')}{' '}
            <a
              href={LICENSE_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('AGPL v3.0 License')}
            </a>
            .
          </p>
        </footer>
      </div>
    </PublicLayout>
  )
}

export function About() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ['about-content'],
    queryFn: getAboutContent,
  })

  const rawContent = data?.data?.trim() ?? ''
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isHttpUrl(rawContent)
  const contentIsHtml = hasContent && isLikelyHtml(rawContent)

  if (isLoading) {
    return (
      <PublicLayout>
        <div className='mx-auto flex max-w-4xl flex-col gap-4 py-12'>
          <Skeleton className='h-8 w-[45%]' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-[90%]' />
          <Skeleton className='h-4 w-[80%]' />
        </div>
      </PublicLayout>
    )
  }

  if (!hasContent) {
    return <AboutMarketing />
  }

  if (isUrl) {
    return (
      <PublicLayout showMainContainer={false}>
        <iframe
          src={rawContent}
          className='h-[calc(100vh-3.5rem)] w-full border-0'
          title={t('About')}
          sandbox='allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'
        />
      </PublicLayout>
    )
  }

  if (contentIsHtml) {
    return (
      <PublicLayout showMainContainer={false}>
        <RichContent
          mode='html'
          htmlVariant='isolated'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-8'>
        <RichContent
          mode='markdown'
          content={rawContent}
          className='prose-neutral dark:prose-invert max-w-none'
        />
      </div>
    </PublicLayout>
  )
}

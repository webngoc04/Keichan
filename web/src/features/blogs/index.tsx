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
  Newspaper,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'

interface BlogPost {
  id: string
  title: string
  date: string
  author: string
  category: string
  summary: string
  readTime: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'deepseek-r1-integration',
    title: 'Optimizing DeepSeek-R1 & V3 Inference Latency Across Global Gateways',
    date: 'Aug 2026',
    author: 'Engineering Core',
    category: 'Architecture',
    summary: 'How our zero-overhead Go gateway proxy streams MoE token outputs with sub-15ms TTFT latency and automated weighted fallback.',
    readTime: '4 min read',
  },
  {
    id: 'multi-provider-resilience',
    title: 'Designing Resilient AI Infrastructure: Circuit Breakers & Dynamic Probing',
    date: 'Jul 2026',
    author: 'Infrastructure Team',
    category: 'Reliability',
    summary: 'A deep dive into our passive health probing algorithms, automated rate-limit recovery, and zero-downtime routing architectures.',
    readTime: '6 min read',
  },
  {
    id: 'enterprise-queue-clusters',
    title: 'Upcoming Enterprise Architecture: High-Concurrency Task Queues',
    date: 'Jun 2026',
    author: 'Product Roadmap',
    category: 'Announcements',
    summary: 'Previewing dedicated worker pools, prioritized task queues, and isolated VPC endpoints for high-throughput enterprise workloads.',
    readTime: '3 min read',
  },
]

export function Blogs() {
  const { t } = useTranslation()

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Newspaper className='size-3.5' />
            <span>// {t('ENGINEERING BLOG & CHANGELOG')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Latest Releases & Technical Notes')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Stay up to date with new model integrations, gateway performance optimizations, and infrastructure upgrades.'
            )}
          </p>
        </div>

        {/* Posts Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 command-corner hover-tech-card shadow-lg'
            >
              <div>
                <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-[11px] text-muted-foreground'>
                  <span className='rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary border border-primary/20'>
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className='text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-3'>
                  {post.title}
                </h2>

                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {post.summary}
                </p>
              </div>

              <div className='mt-6 pt-4 border-t border-border/60 flex items-center justify-between font-mono text-[11px] text-muted-foreground'>
                <span>{post.date} · {post.author}</span>
                <span className='text-primary group-hover:translate-x-1 transition-transform'>
                  <ArrowRight className='size-3.5' />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}

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
  Building2,
  Clock,
  HardDrive,
  Lock,
  Radio,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

import { PublicLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { ContactEnterpriseDialog } from '@/features/pricing/components/contact-enterprise-dialog'

export function Enterprise() {
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Hero */}
        <div className='mx-auto mb-16 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[11px] text-amber-500 uppercase tracking-wider'>
            <Clock className='size-3.5' />
            <span>// {t('ENTERPRISE ROADMAP & WAITLIST')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Enterprise AI Infrastructure')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Dedicated task queue infrastructure and isolated routing clusters are currently under active development. Join our priority waitlist for early access.'
            )}
          </p>
          <div className='mt-6 flex items-center justify-center gap-3'>
            <Button
              className='rounded-full text-xs font-mono'
              onClick={() => setDialogOpen(true)}
            >
              {t('Join Enterprise Waitlist')}
            </Button>
            <Button
              variant='outline'
              className='rounded-full text-xs font-mono'
              render={<Link to='/pricing' />}
            >
              {t('View Standard Plans')}
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[
            {
              icon: HardDrive,
              title: t('Dedicated Queue Clusters'),
              status: t('In Development'),
              desc: t(
                'High-concurrency task queues with zero head-of-line blocking, isolated memory pools, and dedicated worker threads.'
              ),
            },
            {
              icon: ShieldCheck,
              title: t('VPC & Private IP Routing'),
              status: t('In Development'),
              desc: t(
                'Direct AWS PrivateLink, Azure ExpressRoute, and IP CIDR allowlists for maximum enterprise security.'
              ),
            },
            {
              icon: Server,
              title: t('Custom SLA & Uptime Guarantees'),
              status: t('Roadmap'),
              desc: t(
                '99.99% multi-region uptime guarantees with 24/7 dedicated engineering incident response and Slack channel.'
              ),
            },
            {
              icon: Lock,
              title: t('Granular Access & Audit Logs'),
              status: t('Ready'),
              desc: t(
                'Role-based access control (RBAC), token quota limits, per-user channel filters, and tamper-proof audit trails.'
              ),
            },
            {
              icon: Radio,
              title: t('Smart Circuit Breaker Failover'),
              status: t('Ready'),
              desc: t(
                'Automatic latency-aware fallback routing across primary and secondary upstream channels with zero downtime.'
              ),
            },
            {
              icon: Building2,
              title: t('Custom Invoicing & Procurement'),
              status: t('Contact'),
              desc: t(
                'Flexible wire transfer invoicing, customized usage contracts, and consolidated billing across multiple teams.'
              ),
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className='group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md transition-all duration-300 command-corner hover-tech-card shadow-lg'
              >
                <div>
                  <div className='flex items-center justify-between border-b border-border/60 pb-3 mb-4 font-mono text-xs'>
                    <span className='text-[10px] text-muted-foreground'>
                      // 0{idx + 1}
                    </span>
                    <span className='rounded bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20'>
                      {item.status}
                    </span>
                  </div>

                  <div className='flex items-center gap-3 mb-3'>
                    <div className='flex size-10 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary shadow-inner'>
                      <Icon className='size-5' />
                    </div>
                    <h3 className='text-base font-bold text-foreground'>
                      {item.title}
                    </h3>
                  </div>

                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Waitlist Dialog */}
        <ContactEnterpriseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </PublicLayout>
  )
}

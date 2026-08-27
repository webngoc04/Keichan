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
import { Check, Minus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PricingComparison() {
  const { t } = useTranslation()

  const categories = [
    {
      title: t('Model Access & Routing'),
      features: [
        {
          name: t('Standard AI models'),
          free: true,
          payg: true,
          enterprise: true,
        },
        {
          name: t('Flagship AI models (GPT-4o, Claude 3.5, Gemini 1.5 Pro)'),
          free: false,
          payg: true,
          enterprise: true,
        },
        {
          name: t('Dedicated upstream channel routing'),
          free: false,
          payg: false,
          enterprise: true,
        },
        {
          name: t('Smart automatic load balancing & failover'),
          free: t('Basic'),
          payg: t('Advanced'),
          enterprise: t('Custom priority'),
        },
      ],
    },
    {
      title: t('Usage Limits & Performance'),
      features: [
        {
          name: t('Requests per minute (RPM)'),
          free: '60 RPM',
          payg: '600+ RPM',
          enterprise: t('Unlimited / Custom'),
        },
        {
          name: t('Concurrent API connections'),
          free: '5',
          payg: '50+',
          enterprise: t('Unlimited'),
        },
        {
          name: t('Active API keys'),
          free: '1',
          payg: t('Unlimited'),
          enterprise: t('Unlimited'),
        },
        {
          name: t('Credit validity period'),
          free: t('Trial period'),
          payg: t('Never expires'),
          enterprise: t('Contract based'),
        },
      ],
    },
    {
      title: t('Security & Governance'),
      features: [
        {
          name: t('Usage logs & audit trail'),
          free: t('7 days'),
          payg: t('90 days'),
          enterprise: t('1 year+ / Custom'),
        },
        {
          name: t('Multi-user RBAC & team workspaces'),
          free: false,
          payg: false,
          enterprise: true,
        },
        {
          name: t('IP Whitelisting & security policies'),
          free: false,
          payg: true,
          enterprise: true,
        },
        {
          name: t('On-premise / VPC deployment option'),
          free: false,
          payg: false,
          enterprise: true,
        },
      ],
    },
    {
      title: t('Support & Service Level'),
      features: [
        {
          name: t('Uptime SLA guarantee'),
          free: t('Best effort'),
          payg: t('Standard 99.5%'),
          enterprise: t('Guaranteed 99.9%'),
        },
        {
          name: t('Support channel'),
          free: t('Community'),
          payg: t('Ticket support'),
          enterprise: t('24/7 dedicated manager'),
        },
        {
          name: t('Corporate tax invoices & contracts'),
          free: false,
          payg: false,
          enterprise: true,
        },
      ],
    },
  ]

  const renderValue = (val: boolean | string) => {
    if (typeof val === 'boolean') {
      return val ? (
        <Check className='text-primary inline-block size-4 font-bold' />
      ) : (
        <Minus className='text-muted-foreground/40 inline-block size-4' />
      )
    }
    return <span className='text-xs sm:text-sm font-medium'>{val}</span>
  }

  return (
    <div className='overflow-hidden rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md command-corner shadow-xl'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='border-b border-border/80 bg-muted/30 font-mono text-xs'>
              <th className='p-4 font-semibold uppercase tracking-wider text-muted-foreground sm:px-6 sm:py-5 w-2/5'>
                // {t('Feature Matrix')}
              </th>
              <th className='p-4 text-center font-semibold uppercase tracking-wider text-muted-foreground sm:px-6 sm:py-5 w-1/5'>
                [{t('FREE')}]
              </th>
              <th className='p-4 text-center font-bold uppercase tracking-wider text-primary sm:px-6 sm:py-5 w-1/5 bg-primary/5'>
                [{t('PAY AS YOU GO')}]
              </th>
              <th className='p-4 text-center font-semibold uppercase tracking-wider text-muted-foreground sm:px-6 sm:py-5 w-1/5'>
                [{t('ENTERPRISE')}]
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border/40 text-xs sm:text-sm'>
            {categories.map((category) => (
              <>
                <tr key={category.title} className='bg-muted/15 font-mono text-xs font-semibold'>
                  <td
                    colSpan={4}
                    className='px-4 py-3 tracking-wider uppercase text-primary sm:px-6'
                  >
                    // {category.title}
                  </td>
                </tr>
                {category.features.map((feature) => (
                  <tr
                    key={feature.name}
                    className='hover:bg-muted/20 transition-colors'
                  >
                    <td className='px-4 py-3 sm:px-6 font-medium text-foreground/90'>
                      {feature.name}
                    </td>
                    <td className='px-4 py-3 text-center sm:px-6 text-muted-foreground'>
                      {renderValue(feature.free)}
                    </td>
                    <td className='px-4 py-3 text-center sm:px-6 bg-primary/[0.02]'>
                      {renderValue(feature.payg)}
                    </td>
                    <td className='px-4 py-3 text-center sm:px-6 text-muted-foreground'>
                      {renderValue(feature.enterprise)}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

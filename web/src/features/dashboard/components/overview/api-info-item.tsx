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
import { Zap, ExternalLink, Gauge } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import {
  getLatencyColorClass,
  openExternalSpeedTest,
} from '@/features/dashboard/lib/api-info'
import type { ApiInfoItem, PingStatus } from '@/features/dashboard/types'
import { getBgColorClass } from '@/lib/colors'
import { cn } from '@/lib/utils'

interface ApiInfoItemProps {
  item: ApiInfoItem
}

export function ApiInfoItemComponent(props: ApiInfoItemProps) {
  const { t } = useTranslation()
  const item = props.item

  return (
    <div className='group hover:bg-muted/30 flex items-center justify-between gap-3 px-4 py-3 transition-all duration-200 sm:px-5'>
      <div className='flex min-w-0 flex-1 items-center gap-3'>
        <span
          className={cn(
            'inline-block size-2 shrink-0 rounded-full',
            getBgColorClass(item.color)
          )}
        />

        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <div className='flex items-center gap-2'>
            <span className='font-mono text-xs font-semibold text-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/60'>
              {item.route}
            </span>
            {item.description && (
              <span className='text-muted-foreground hidden truncate text-xs md:inline'>
                {item.description}
              </span>
            )}
          </div>
          <span className='text-muted-foreground/60 truncate font-mono text-[11px] select-all'>
            {item.url}
          </span>
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1.5'>
        <CopyButton
          value={item.url}
          variant='outline'
          size='sm'
          className='h-8 gap-1.5 px-2.5 font-mono text-xs'
          iconClassName='size-3.5'
          tooltip={t('Copy URL')}
          aria-label={t('Copy URL')}
        />

        <Button
          variant='ghost'
          size='sm'
          className='size-8 p-0 text-muted-foreground hover:text-foreground'
          title={t('Open in New Tab')}
          render={<a href={item.url} target='_blank' rel='noreferrer' />}
        >
          <ExternalLink className='size-3.5' />
        </Button>
      </div>
    </div>
  )
}

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
import type { SVGProps } from 'react'

import { cn } from '@/lib/utils'

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      className={cn('size-6 shrink-0', className)}
      {...props}
    >
      <title>Logo</title>
      <rect
        width='22'
        height='22'
        x='1'
        y='1'
        rx='6'
        className='fill-neutral-950 stroke-white/20 dark:fill-black dark:stroke-white/25'
        strokeWidth='1.25'
      />
      <path
        d='M12 6.5v11M6.5 12h11'
        stroke='#FFFFFF'
        strokeWidth='2.25'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

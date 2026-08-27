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
import { Link, useRouterState } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface PublicNavigationProps {
  className?: string
}

export function PublicNavigation({ className }: PublicNavigationProps = {}) {
  const { t } = useTranslation()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const links = [
    { title: t('Home'), href: '/' },
    { title: t('Models'), href: '/models/' },
    { title: t('Pricing'), href: '/pricing' },
    { title: t('Docs'), href: '/docs' },
    { title: t('About'), href: '/about' },
  ]

  return (
    <nav className={cn('hidden items-center gap-1 sm:flex', className)}>
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            to={link.href}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200',
              isActive
                ? 'bg-muted text-foreground font-semibold shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {link.title}
          </Link>
        )
      })}
    </nav>
  )
}

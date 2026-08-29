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
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import {
  IconDiscord,
  IconGithub,
  IconGoogle,
  IconLinuxDo,
  IconTelegram,
  IconWeChat,
} from '@/assets/brand-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useOAuthLogin } from '../hooks/use-oauth-login'
import type { SystemStatus } from '../types'
import { TelegramLoginDialog } from './telegram-login-dialog'

type OAuthProvidersProps = {
  status: SystemStatus | null
  disabled?: boolean
  className?: string
  onWeChatLogin?: () => void
  isWeChatLoading?: boolean
  redirectTo?: string
  showDivider?: boolean
  layout?: 'column' | 'grid' | 'contents'
}

type ProviderButton = {
  key: string
  label: string
  onClick: () => void
  icon?: ReactNode
  disabled?: boolean
}

export function OAuthProviders({
  status,
  disabled = false,
  className,
  onWeChatLogin,
  isWeChatLoading = false,
  redirectTo,
  showDivider = true,
  layout = 'column',
}: OAuthProvidersProps) {
  const { t } = useTranslation()
  const {
    isLoading,
    githubButtonText,
    githubButtonDisabled,
    handleGoogleLogin,
    handleGitHubLogin,
    handleDiscordLogin,
    handleOIDCLogin,
    handleLinuxDOLogin,
    handleTelegramLogin,
    handleCustomOAuthLogin,
    isTelegramDialogOpen,
    isTelegramPending,
    handleTelegramAuthorization,
    setIsTelegramDialogOpen,
  } = useOAuthLogin(status, redirectTo)

  const isCompact = layout === 'grid' || layout === 'contents'
  const providerButtons: ProviderButton[] = []

  if (status?.wechat_login && onWeChatLogin) {
    providerButtons.push({
      key: 'wechat',
      label: isCompact ? 'WeChat' : t('Continue with WeChat'),
      onClick: onWeChatLogin,
      icon: <IconWeChat className='h-4 w-4' />,
      disabled: isWeChatLoading,
    })
  }

  if (status?.google_oauth) {
    providerButtons.push({
      key: 'google',
      label: isCompact ? 'Google' : t('Continue with Google'),
      onClick: handleGoogleLogin,
      icon: <IconGoogle className='h-4 w-4' />,
      disabled: false,
    })
  }

  if (status?.github_oauth) {
    providerButtons.push({
      key: 'github',
      label: isCompact ? 'GitHub' : (githubButtonText || t('Continue with GitHub')),
      onClick: handleGitHubLogin,
      icon: <IconGithub className='h-4 w-4' />,
      disabled: githubButtonDisabled,
    })
  }

  if (status?.discord_oauth) {
    providerButtons.push({
      key: 'discord',
      label: isCompact ? 'Discord' : t('Continue with Discord'),
      onClick: handleDiscordLogin,
      icon: <IconDiscord className='h-4 w-4' />,
    })
  }

  if (status?.oidc_enabled) {
    const oidcDisplayName = status.oidc_display_name?.trim() || 'OIDC'
    providerButtons.push({
      key: 'oidc',
      label: isCompact ? oidcDisplayName : t('Continue with {{name}}', {
        name: oidcDisplayName,
      }),
      onClick: handleOIDCLogin,
    })
  }

  if (status?.linuxdo_oauth) {
    providerButtons.push({
      key: 'linuxdo',
      label: isCompact ? 'LinuxDO' : t('Continue with LinuxDO'),
      onClick: handleLinuxDOLogin,
      icon: <IconLinuxDo className='h-4 w-4' />,
    })
  }

  if (status?.telegram_oauth) {
    providerButtons.push({
      key: 'telegram',
      label: isCompact ? 'Telegram' : t('Continue with Telegram'),
      onClick: handleTelegramLogin,
      icon: <IconTelegram data-icon='inline-start' />,
    })
  }

  // Custom OAuth providers
  const customProviders = status?.custom_oauth_providers
  if (customProviders && customProviders.length > 0) {
    for (const provider of customProviders) {
      providerButtons.push({
        key: `custom-${provider.slug}`,
        label: isCompact ? provider.name : t('Continue with {{name}}', { name: provider.name }),
        onClick: () => handleCustomOAuthLogin(provider),
      })
    }
  }

  if (providerButtons.length === 0) return null

  const renderedButtons = providerButtons.map(
    ({ key, label, onClick, icon, disabled: extraDisabled }) => (
      <Button
        key={key}
        variant='outline'
        type='button'
        disabled={disabled || isLoading || extraDisabled}
        onClick={onClick}
        className='h-11 w-full justify-center gap-2 rounded-full border-border/80 hover:border-foreground/40 font-mono text-xs font-medium transition-all'
      >
        {icon}
        <span className='truncate'>{label}</span>
      </Button>
    )
  )

  if (layout === 'contents') {
    return (
      <>
        {renderedButtons}
        <TelegramLoginDialog
          open={isTelegramDialogOpen}
          botName={status?.telegram_bot_name ?? ''}
          pending={isTelegramPending}
          onOpenChange={setIsTelegramDialogOpen}
          onAuthorization={handleTelegramAuthorization}
        />
      </>
    )
  }

  return (
    <>
      <div className={cn('space-y-3', className)}>
        {showDivider && (
          <div className='relative my-4'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-border/60' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-card px-3 font-mono text-[10px] text-muted-foreground tracking-wider'>
                // {t('Or continue with')}
              </span>
            </div>
          </div>
        )}

        <div className={cn(layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2')}>
          {renderedButtons}
        </div>
      </div>

      <TelegramLoginDialog
        open={isTelegramDialogOpen}
        botName={status?.telegram_bot_name ?? ''}
        pending={isTelegramPending}
        onOpenChange={setIsTelegramDialogOpen}
        onAuthorization={handleTelegramAuthorization}
      />
    </>
  )
}

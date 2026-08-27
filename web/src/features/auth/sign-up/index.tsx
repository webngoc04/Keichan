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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { useStatus } from '@/hooks/use-status'

import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { t } = useTranslation()
  const { status } = useStatus()

  return (
    <AuthLayout>
      <div className='w-full space-y-6'>
        <div className='space-y-2 border-b border-border/60 pb-4'>
          <div className='inline-flex items-center gap-2 font-mono text-xs text-primary font-medium tracking-wider uppercase'>
            <span>// 02 REGISTRATION</span>
          </div>
          <h2 className='text-fluid-h2 font-bold tracking-tight text-foreground'>
            {t('Create an account')}
          </h2>
          <p className='text-muted-foreground text-xs sm:text-sm leading-relaxed'>
            {t('Already have an account?')}{' '}
            <Link
              to='/sign-in'
              className='text-primary hover:underline font-medium underline-offset-4'
            >
              {t('Sign in')}
            </Link>
            .
          </p>
        </div>

        <SignUpForm />

        <TermsFooter
          variant='sign-up'
          status={status}
          className='text-center text-xs text-muted-foreground/70 pt-2'
        />
      </div>
    </AuthLayout>
  )
}

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
import { Download, Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PublicLayout } from '@/components/layout'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

export function Brand() {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const [copiedHex, setCopiedHex] = useState<string | null>(null)

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  return (
    <PublicLayout showMainContainer={false}>
      <div className='relative z-10 mx-auto max-w-[1220px] px-4 py-12 sm:px-6 md:py-16 pt-24 sm:pt-28'>
        {/* Header */}
        <div className='mx-auto mb-12 max-w-3xl text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 font-mono text-[11px] text-primary uppercase tracking-wider'>
            <Palette className='size-3.5' />
            <span>// {t('BRAND ASSETS & GUIDELINES')}</span>
          </div>
          <h1 className='text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground'>
            {t('Brand Identity')}
          </h1>
          <p className='text-muted-foreground mt-4 text-sm sm:text-base leading-relaxed'>
            {t(
              'Official logos, iconography, typography, and color codes for partner integrations and media publications.'
            )}
          </p>
        </div>

        {/* Logo Cards */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-12'>
          <div className='rounded-2xl border border-border/80 bg-card/60 p-8 backdrop-blur-md command-corner flex flex-col items-center justify-center text-center shadow-lg'>
            <div className='flex size-24 items-center justify-center rounded-2xl border border-border/80 bg-[#0A0B10] shadow-inner mb-6'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className='size-14' fill="none">
                <rect width="60" height="60" x="2" y="2" rx="16" fill="#0A0B10" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="3"/>
                <path d="M32 17v30M17 32h30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className='text-base font-bold text-foreground mb-1'>
              {systemName || 'Keichan'} Mark (Icon)
            </h3>
            <p className='text-xs text-muted-foreground font-mono mb-4'>
              SVG Vector Format · 64x64
            </p>
            <a
              href='/favicon.svg'
              download='brand-mark.svg'
              className='inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-4 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors'
            >
              <Download className='size-3.5' />
              <span>{t('Download SVG')}</span>
            </a>
          </div>

          <div className='rounded-2xl border border-border/80 bg-card/60 p-8 backdrop-blur-md command-corner flex flex-col items-center justify-center text-center shadow-lg'>
            <div className='flex h-24 items-center justify-center gap-3 px-6 rounded-2xl border border-border/80 bg-[#0A0B10] shadow-inner mb-6'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className='size-10' fill="none">
                <rect width="60" height="60" x="2" y="2" rx="16" fill="#0A0B10" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="3"/>
                <path d="M32 17v30M17 32h30" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className='font-mono text-xl font-bold tracking-tight text-white'>
                {systemName || 'Keichan'}
              </span>
            </div>
            <h3 className='text-base font-bold text-foreground mb-1'>
              {systemName || 'Keichan'} Full Logotype
            </h3>
            <p className='text-xs text-muted-foreground font-mono mb-4'>
              Dark Tech Palette
            </p>
            <a
              href='/logo.svg'
              download='full-logo.svg'
              className='inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/30 px-4 py-1.5 font-mono text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-colors'
            >
              <Download className='size-3.5' />
              <span>{t('Download SVG')}</span>
            </a>
          </div>
        </div>

        {/* Color Palette */}
        <div className='max-w-4xl mx-auto'>
          <h3 className='font-mono text-sm font-bold text-foreground mb-4'>
            // {t('Primary Color System')}
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[
              { name: 'Dark Void', hex: '#0A0B10', bg: 'bg-[#0A0B10]', text: 'text-white' },
              { name: 'Pure White', hex: '#FFFFFF', bg: 'bg-white', text: 'text-black' },
              { name: 'Emerald Glow', hex: '#10B981', bg: 'bg-emerald-500', text: 'text-black' },
              { name: 'Cyber Violet', hex: '#8B5CF6', bg: 'bg-violet-500', text: 'text-white' },
            ].map((col) => (
              <div
                key={col.hex}
                onClick={() => copyColor(col.hex)}
                className='cursor-pointer rounded-xl border border-border/80 bg-card/60 p-3 backdrop-blur-md command-corner transition-all hover:scale-[1.02]'
              >
                <div className={cn('h-14 rounded-lg mb-2 shadow-inner border border-white/10', col.bg)} />
                <div className='flex items-center justify-between font-mono text-xs'>
                  <span className='font-bold text-foreground'>{col.name}</span>
                  <span className='text-[11px] text-muted-foreground'>{col.hex}</span>
                </div>
                {copiedHex === col.hex && (
                  <div className='text-[10px] text-primary font-mono mt-1'>
                    {t('Copied!')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { edexAudio } from './edex-audio'

interface EdexBootScreenProps {
  onComplete?: () => void
}

export function EdexBootScreen({ onComplete }: EdexBootScreenProps) {
  const { t } = useTranslation()
  const [lines, setLines] = useState<string[]>([])
  const [stage, setStage] = useState<'terminal' | 'title' | 'done'>('terminal')

  const bootLogs = [
    t('>> INITIALIZING KEICHAN eDEX-UI KERNEL...'),
    t('>> DETECTING SYSTEM TOPOLOGY & NETWORK INTERFACES...'),
    t('>> LOADING REVERSE PROXY DISPATCH PIPELINES...'),
    t('>> MOUNTING 50+ UPSTREAM AI ADAPTORS [OPENAI, CLAUDE, GEMINI, DEEPSEEK]...'),
    t('>> STARTING SSE REAL-TIME PUB/SUB EVENT STREAM...'),
    t('>> INITIALIZING TOKEN ACCOUNTING & RBAC GOVERNANCE...'),
    t('>> ALL SYSTEMS NOMINAL. BOOT COMPLETE.'),
  ]

  useEffect(() => {
    // If already booted in this session, finish immediately
    const alreadyBooted = sessionStorage.getItem('edex_booted')
    if (alreadyBooted) {
      setStage('done')
      onComplete?.()
      return
    }

    let lineIndex = 0
    const interval = setInterval(() => {
      if (lineIndex < bootLogs.length) {
        const nextLine = bootLogs[lineIndex]
        setLines((prev) => [...prev, nextLine])
        edexAudio.playBootBeep(700 + lineIndex * 60)
        lineIndex++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setStage('title')
          edexAudio.playBootComplete()
          setTimeout(() => {
            sessionStorage.setItem('edex_booted', 'true')
            setStage('done')
            onComplete?.()
          }, 800)
        }, 200)
      }
    }, 120)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sessionStorage.setItem('edex_booted', 'true')
        setStage('done')
        onComplete?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bootLogs, onComplete])

  if (stage === 'done') return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[99999] flex flex-col justify-between bg-black/95 p-6 font-mono text-xs text-primary backdrop-blur-2xl transition-opacity duration-500 select-none',
        stage === 'title' ? 'items-center justify-center' : 'items-start justify-end'
      )}
      onClick={() => {
        sessionStorage.setItem('edex_booted', 'true')
        setStage('done')
        onComplete?.()
      }}
    >
      {stage === 'terminal' && (
        <div className='w-full max-w-3xl space-y-1.5'>
          {lines.map((line, i) => (
            <div key={i} className='leading-relaxed tracking-wider text-cyan-400'>
              {line}
            </div>
          ))}
          <div className='flex items-center gap-2 pt-2 text-[10px] text-muted-foreground'>
            <span className='size-2 rounded-full bg-primary animate-ping' />
            <span>[{t('PRESS ESC OR CLICK TO SKIP')}]</span>
          </div>
        </div>
      )}

      {stage === 'title' && (
        <div className='flex flex-col items-center justify-center text-center'>
          <h1
            className='cyber-glitch-active text-5xl sm:text-7xl font-extrabold tracking-widest text-cyan-400 font-mono'
            data-text='KEICHAN // eDEX'
          >
            KEICHAN // eDEX
          </h1>
          <div className='mt-3 text-xs tracking-widest text-violet-400 uppercase font-mono'>
            [{t('GATEWAY COCKPIT READY')}]
          </div>
        </div>
      )}
    </div>
  )
}

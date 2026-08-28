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
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const HACKER_GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF_<>{}[]*+=#~!/\\$'

interface ScrambleTextProps {
  text: string
  className?: string
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'p'
  speed?: number
  cycles?: number
  triggerOnHover?: boolean
  autoTrigger?: boolean
  delay?: number
}

/**
 * ScrambleText gives text a high-tech matrix / hacker random character decryption effect
 * on initial load and optional hover.
 */
export function ScrambleText({
  text,
  className,
  as: Component = 'span',
  speed = 28,
  cycles = 2,
  triggerOnHover = true,
  autoTrigger = true,
  delay = 0,
}: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const isScramblingRef = useRef(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startScramble = useCallback(() => {
    if (isScramblingRef.current) return
    isScramblingRef.current = true

    let iteration = 0
    const targetLength = text.length
    const totalSteps = targetLength * cycles

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        const revealedCount = Math.floor(iteration / cycles)
        let output = ''

        for (let i = 0; i < targetLength; i++) {
          const char = text[i]
          if (char === ' ' || char === '\n') {
            output += char
          } else if (i < revealedCount) {
            output += char
          } else {
            const randomGlyph =
              HACKER_GLYPHS[Math.floor(Math.random() * HACKER_GLYPHS.length)]
            output += randomGlyph
          }
        }
        return output
      })

      iteration += 1

      if (iteration > totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        isScramblingRef.current = false
      }
    }, speed)
  }, [text, speed, cycles])

  useEffect(() => {
    if (autoTrigger) {
      if (delay > 0) {
        timeoutRef.current = setTimeout(startScramble, delay)
      } else {
        startScramble()
      }
    } else {
      setDisplayText(text)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      isScramblingRef.current = false
    }
  }, [text, autoTrigger, delay, startScramble])

  const handleMouseEnter = () => {
    if (triggerOnHover && !isScramblingRef.current) {
      startScramble()
    }
  }

  return (
    <Component
      className={cn('inline-block font-inherit transition-colors', className)}
      onMouseEnter={handleMouseEnter}
    >
      {displayText}
    </Component>
  )
}

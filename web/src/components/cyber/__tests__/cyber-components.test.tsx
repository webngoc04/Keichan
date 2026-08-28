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
import { render, screen, act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { CyberBadge } from '../cyber-badge'
import { EdexTelemetryBar } from '../edex-telemetry'
import { GlitchText } from '../glitch-text'
import { ScrambleText } from '../scramble-text'

describe('Cyber Components', () => {
  describe('CyberBadge', () => {
    it('renders label and tag properly', () => {
      render(<CyberBadge label='ONLINE' tag='STATUS' pulseColor='emerald' glow />)
      expect(screen.getByText('ONLINE')).toBeInTheDocument()
      expect(screen.getByText('STATUS:')).toBeInTheDocument()
    })
  })

  describe('GlitchText', () => {
    it('renders data-text attribute matching children', () => {
      const { container } = render(<GlitchText hoverOnly>CYBERPUNK</GlitchText>)
      const el = container.querySelector('[data-text="CYBERPUNK"]')
      expect(el).toBeInTheDocument()
      expect(el).toHaveClass('cyber-glitch-hover')
    })
  })

  describe('ScrambleText', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('eventually decodes into the target text after animation completes', () => {
      const { container } = render(<ScrambleText text='TEST MATRIX' speed={10} cycles={2} autoTrigger />)
      
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(container.textContent).toBe('TEST MATRIX')
    })

    it('triggers scramble on mouse enter if triggerOnHover is true', () => {
      const { container } = render(<ScrambleText text='HOVER ME' speed={10} cycles={2} triggerOnHover autoTrigger={false} />)
      expect(container.textContent).toBe('HOVER ME')

      const el = container.firstChild as HTMLElement
      fireEvent.mouseEnter(el)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(container.textContent).toBe('HOVER ME')
    })
  })

  describe('EdexTelemetryBar', () => {
    it('renders node telemetry and latency', () => {
      render(<EdexTelemetryBar latency='12ms' nodeName='TEST-NODE' channelsCount='40+' />)
      expect(screen.getByText(/TEST-NODE/)).toBeInTheDocument()
      expect(screen.getByText(/12ms/)).toBeInTheDocument()
    })
  })
})

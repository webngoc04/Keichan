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
import { renderHook, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRealLatency } from '../use-real-latency'

describe('useRealLatency', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('measures real latency on successful ping', async () => {
    let callCount = 0
    global.fetch = vi.fn().mockImplementation(async () => {
      callCount++
      return { ok: true }
    })

    const { result } = renderHook(() => useRealLatency(5000))

    // Initial state before fetch completes
    expect(result.current.formatted).toBe('LIVE')
    expect(result.current.status).toBe('connecting')

    await act(async () => {
      await Promise.resolve()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/status', expect.objectContaining({ method: 'GET' }))
    expect(result.current.latency).toBeGreaterThanOrEqual(1)
    expect(result.current.formatted).toMatch(/^\d+ms$/)
    expect(['optimal', 'good', 'slow']).toContain(result.current.status)
  })

  it('handles fetch network errors gracefully without crashing', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRealLatency(5000))

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.latency).toBeNull()
    expect(result.current.status).toBe('connecting')
    expect(result.current.formatted).toBe('LIVE')
  })
})

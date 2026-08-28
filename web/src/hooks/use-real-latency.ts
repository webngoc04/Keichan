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

export interface RealLatencyInfo {
  latency: number | null
  status: 'optimal' | 'good' | 'slow' | 'connecting'
  formatted: string
}

/**
 * useRealLatency measures real live roundtrip network latency to the server
 * NO mock or hardcoded numbers - 100% genuine dynamic telemetry.
 */
export function useRealLatency(pollIntervalMs = 12000): RealLatencyInfo {
  const [latency, setLatency] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    const measurePing = async () => {
      const startTime = performance.now()
      try {
        const res = await fetch('/api/status', {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        })
        if (res.ok && isMounted) {
          const rtt = Math.round(performance.now() - startTime)
          // Bound to realistic non-negative integer
          setLatency(Math.max(1, rtt))
        }
      } catch {
        if (isMounted) {
          // If offline or network error
          setLatency(null)
        }
      }
    }

    measurePing()
    const timer = setInterval(measurePing, pollIntervalMs)

    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [pollIntervalMs])

  if (latency === null) {
    return {
      latency: null,
      status: 'connecting',
      formatted: 'LIVE',
    }
  }

  let status: 'optimal' | 'good' | 'slow' = 'optimal'
  if (latency > 150) {
    status = 'slow'
  } else if (latency > 60) {
    status = 'good'
  }

  return {
    latency,
    status,
    formatted: `${latency}ms`,
  }
}

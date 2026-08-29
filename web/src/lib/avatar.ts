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
import type { CSSProperties } from 'react'

export type UserAvatarStyle = Pick<CSSProperties, 'backgroundColor' | 'color'>

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getUserAvatarStyle(name: string): UserAvatarStyle {
  const hash = hashString(name)
  const hue = hash % 360
  const saturation = 54 + (hash % 8)
  const lightness = 52 + ((hash >> 4) % 8)

  return {
    backgroundColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
    color: 'white',
  }
}

export function getUserAvatarFallback(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export function getUserAvatarUrl(user?: { avatar_url?: string; email?: string; setting?: Record<string, unknown> | string } | null): string | undefined {
  if (!user) return undefined
  if (user.avatar_url && typeof user.avatar_url === 'string' && user.avatar_url.trim()) {
    return user.avatar_url.trim()
  }
  if (user.setting) {
    if (typeof user.setting === 'object' && user.setting !== null && 'avatar_url' in user.setting) {
      const url = (user.setting as Record<string, unknown>).avatar_url
      if (typeof url === 'string' && url.trim()) {
        return url.trim()
      }
    } else if (typeof user.setting === 'string') {
      try {
        const parsed = JSON.parse(user.setting)
        if (parsed?.avatar_url && typeof parsed.avatar_url === 'string' && parsed.avatar_url.trim()) {
          return parsed.avatar_url.trim()
        }
      } catch {
        // ignore
      }
    }
  }
  return undefined
}


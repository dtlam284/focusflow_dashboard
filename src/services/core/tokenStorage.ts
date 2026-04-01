import { env } from '@/config/env'
import type { AuthTokens, TokenStorage } from './types'

const canUseLocalStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

let inMemoryTokens: AuthTokens | null = null

export class BrowserTokenStorage implements TokenStorage {
  getTokens(): AuthTokens | null {
    if (canUseLocalStorage()) {
      const raw = window.localStorage.getItem(env.tokenStorageKey)
      if (!raw) {
        return null
      }

      try {
        const parsed = JSON.parse(raw) as AuthTokens

        if (!parsed.accessToken || !parsed.refreshToken) {
          return null
        }

        return parsed
      } catch {
        return null
      }
    }

    return inMemoryTokens
  }

  setTokens(tokens: AuthTokens): void {
    inMemoryTokens = tokens

    if (canUseLocalStorage()) {
      window.localStorage.setItem(env.tokenStorageKey, JSON.stringify(tokens))
    }
  }

  clearTokens(): void {
    inMemoryTokens = null

    if (canUseLocalStorage()) {
      window.localStorage.removeItem(env.tokenStorageKey)
    }
  }
}

export const tokenStorage = new BrowserTokenStorage()

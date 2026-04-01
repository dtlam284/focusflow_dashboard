import type { AdminUser } from '@/models/account'

export interface AuthLoginResponse {
  token: string
  refreshToken: string
  tokenExpires: number
  user: AdminUser
}

export interface AuthRefreshResponse {
  token: string
  refreshToken: string
  tokenExpires: number
}

export interface AuthLogoutResponse {
  success: true
}

export type AuthLogoutAllResponse = void

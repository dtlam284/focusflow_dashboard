export type ApiRecord = Record<string, unknown>

export type PrimitiveQueryValue = string | number | boolean | null | undefined | Date
export type QueryValue = PrimitiveQueryValue | PrimitiveQueryValue[] | ApiRecord
export type QueryParams = Record<string, QueryValue>

export type EntityId = string | number

export interface DataResponse<TData> {
  data: TData
}

export interface PaginatedResponse<TData> {
  data: TData[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SuccessResponse {
  success: boolean
  [key: string]: unknown
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenExpires?: number
}

export interface TokenStorage {
  getTokens(): AuthTokens | null
  setTokens(tokens: AuthTokens): void
  clearTokens(): void
}

export interface LoginResponse {
  token: string
  refreshToken: string
  tokenExpires?: number
  [key: string]: unknown
}

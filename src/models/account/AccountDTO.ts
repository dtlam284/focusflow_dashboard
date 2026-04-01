import type { PaginatedQuery, PaginationQuery } from '@/models/common'

export interface UserFilters extends PaginatedQuery {
  role?: string | number
  status?: string | number
  roles?: Array<{ id: number }>
  filters?: {
    roles?: Array<{ id: number }>
  }
  filterOptions?: {
    roles?: Array<{ id: number }>
  }
  sort?: Array<{
    orderBy: string
    order: 'ASC' | 'DESC' | 'asc' | 'desc'
  }>
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: { id: number }
  status?: { id: number }
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: { id: number }
  status?: { id: number }
  photo?: string
}

export interface CreatePermissionRequest {
  action: string
  description: string
}

export interface LoginAuditFilters extends PaginationQuery {
  email?: string
  userId?: string
  provider?: string
  status?: string
  success?: boolean
  startDate?: string
  endDate?: string
}

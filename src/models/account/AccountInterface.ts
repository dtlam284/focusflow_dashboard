import type { ID, ISODateString, RoleRef, StatusRef } from '@/models/common'

export interface AdminUser {
  id: ID
  email: string
  firstName: string
  lastName: string
  role: RoleRef
  status: StatusRef
  photo?: string
  createdAt?: ISODateString
  updatedAt?: ISODateString
}

export interface PermissionItem {
  id: number | string
  action: string
  description: string
}

export interface LoginAuditItem {
  id: string
  userId?: string
  email?: string
  provider?: string
  success?: boolean
  status?: 'success' | 'failed' | string
  ip?: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: string
  failureReason?: string
  createdAt: ISODateString
}

export interface LoginAuditStats {
  totalAttempts: number
  successCount: number
  failedCount: number
  uniqueUsers: number
}

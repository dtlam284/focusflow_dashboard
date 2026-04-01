import type { ISODateString } from '@/models/common'

export interface SessionItem {
  id: string | number
  ip?: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: string
  isCurrent: boolean
  createdAt: ISODateString
  lastActiveAt?: ISODateString
}

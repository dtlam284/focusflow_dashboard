export type ISODateString = string
export type ID = string

export interface RoleRef {
  id: number
  name: string
}

export interface StatusRef {
  id: number
  name: string
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface DateRangeQuery {
  from?: string
  to?: string
  startDate?: string
  endDate?: string
}

export interface PaginatedQuery extends PaginationQuery {
  search?: string
}

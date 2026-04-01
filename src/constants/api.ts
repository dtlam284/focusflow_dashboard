export type ApiEntityId = string | number

const withId = (prefix: string, id: ApiEntityId): string => `${prefix}/${id}`

export const API_ENDPOINTS = {
  auth: {
    loginEmail: '/auth/email/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    logoutAll: '/auth/logout/all',
    me: '/auth/me',
    sessions: '/auth/sessions',
    sessionById: (id: ApiEntityId): string => withId('/auth/sessions', id),
  },

  users: {
    root: '/users',
    byId: (id: ApiEntityId): string => withId('/users', id),
  },

  permissions: {
    root: '/permissions',
    byId: (id: ApiEntityId): string => withId('/permissions', id),
  },

  loginAudit: {
    root: '/admin/login-audit',
    stats: '/admin/login-audit/stats',
  },
} as const

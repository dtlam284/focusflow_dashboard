const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  apiTimeoutMs: toNumber(import.meta.env.VITE_API_TIMEOUT_MS, 30000),
  tokenStorageKey:
    import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY ?? 'base.cms.auth',
}

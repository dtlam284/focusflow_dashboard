import type { RootState } from '@/app/store/store'

export const selectSmartLinkingPreferencesState = (
  state: RootState,
) => state.smartLinkingPreferences

export const selectIsSmartLinkingEnabled = (
  state: RootState,
) => state.smartLinkingPreferences.enabled

export const selectSmartLinkingMaxSuggestions = (
  state: RootState,
) => state.smartLinkingPreferences.maxSuggestions

export const selectSmartLinkingShowReasons = (
  state: RootState,
) => state.smartLinkingPreferences.showReasons

export const selectSmartLinkingHideDismissed = (
  state: RootState,
) => state.smartLinkingPreferences.hideDismissed

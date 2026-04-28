import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//#region types
export interface ISmartLinkingPreferencesState {
    enabled: boolean
    maxSuggestions: 3 | 5 | 10
    showReasons: boolean
    hideDismissed: boolean
}
//#endregion types

//#region state
const initialState: ISmartLinkingPreferencesState = {
    enabled: true,
    maxSuggestions: 5,
    showReasons: true,
    hideDismissed: true,
}
//#endregion state

//#region slice
const smartLinkingPreferencesSlice = createSlice({
    name: 'smartLinkingPreferences',
    initialState,
    reducers: {
        setSmartLinkingEnabled: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.enabled = action.payload
        },

        setSmartLinkingMaxSuggestions: (
            state,
            action: PayloadAction<3 | 5 | 10>,
        ) => {
            state.maxSuggestions = action.payload
        },

        setSmartLinkingShowReasons: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.showReasons = action.payload
        },

        setSmartLinkingHideDismissed: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.hideDismissed = action.payload
        },

        resetSmartLinkingPreferences: (state) => {
            state.enabled = initialState.enabled
            state.maxSuggestions = initialState.maxSuggestions
            state.showReasons = initialState.showReasons
            state.hideDismissed = initialState.hideDismissed
        },
    },
})
//#endregion slice

//#region exports
export const {
    setSmartLinkingEnabled,
    setSmartLinkingMaxSuggestions,
    setSmartLinkingShowReasons,
    setSmartLinkingHideDismissed,
    resetSmartLinkingPreferences,
} = smartLinkingPreferencesSlice.actions

export default smartLinkingPreferencesSlice.reducer
//#endregion exports

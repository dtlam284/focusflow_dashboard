import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//#region types
export interface ILinkDetailState {
    selectedLinkId: string | null
    isOpen: boolean
}
//#endregion types

//#region state
const initialState: ILinkDetailState = {
    selectedLinkId: null,
    isOpen: false,
}
//#endregion state

//#region slice
const linkDetailSlice = createSlice({
    name: 'linkDetail',
    initialState,
    reducers: {
        openLinkDetail: (state, action: PayloadAction<string>) => {
            state.selectedLinkId = action.payload
            state.isOpen = true
        },
        closeLinkDetail: (state) => {
            state.selectedLinkId = null
            state.isOpen = false
        },
    },
})
//#endregion slice

//#region exports
export const { openLinkDetail, closeLinkDetail } = linkDetailSlice.actions

export default linkDetailSlice.reducer
//#endregion exports

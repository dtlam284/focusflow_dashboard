import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//#region types
export interface INoteDetailState {
    selectedNoteId: string | null
    isOpen: boolean
}
//#endregion types

//#region state
const initialState: INoteDetailState = {
    selectedNoteId: null,
    isOpen: false,
}
//#endregion state

//#region slice
const noteDetailSlice = createSlice({
    name: 'noteDetail',
    initialState,
    reducers: {
        openNoteDetail: (state, action: PayloadAction<string>) => {
            state.selectedNoteId = action.payload
            state.isOpen = true
        },
        closeNoteDetail: (state) => {
            state.selectedNoteId = null
            state.isOpen = false
        },
    },
})
//#endregion slice

//#region exports
export const { openNoteDetail, closeNoteDetail } = noteDetailSlice.actions

export default noteDetailSlice.reducer
//#endregion exports

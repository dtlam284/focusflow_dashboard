import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'

//#region base selectors
export const selectNoteDetailState = (state: RootState) => state.noteDetail
export const selectIsNoteDetailOpen = (state: RootState) => state.noteDetail.isOpen
export const selectSelectedNoteId = (state: RootState) => state.noteDetail.selectedNoteId
//#endregion base selectors

//#region derived selectors
export const selectSelectedNoteDetail = createSelector(
    [(state: RootState) => state.notes.items, selectSelectedNoteId],
    (notes, selectedNoteId) =>
        notes.find((note) => note.id === selectedNoteId) ?? null,
)
//#endregion derived selectors

import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'

//#region base selectors
export const selectLinkDetailState = (state: RootState) => state.linkDetail
export const selectIsLinkDetailOpen = (state: RootState) => state.linkDetail.isOpen
export const selectSelectedLinkId = (state: RootState) => state.linkDetail.selectedLinkId
//#endregion base selectors

//#region derived selectors
export const selectSelectedLinkDetail = createSelector(
    [(state: RootState) => state.links.items, selectSelectedLinkId],
    (links, selectedLinkId) =>
        links.find((link) => link.id === selectedLinkId) ?? null,
)
//#endregion derived selectors

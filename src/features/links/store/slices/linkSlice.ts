import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ILink, ILinkFilters, ILinksState } from '@/features/links/types/linkTypes'

//#region state
const initialState: ILinksState = {
  items: [],
  filters: {
    keyword: '',
    category: 'all',
  },
}
//#endregion state

//#region payload types
type UpdateLinkPayload = {
  id: string
  changes: Partial<Omit<ILink, 'id' | 'createdAt'>>
}
//#endregion payload types

//#region slice
const linkSlice = createSlice({
  name: 'links',
  initialState,
  reducers: {
    addLink: (state, action: PayloadAction<ILink>) => {
      state.items.unshift(action.payload)
    },

    updateLink: (state, action: PayloadAction<UpdateLinkPayload>) => {
      const { id, changes } = action.payload
      const link = state.items.find((item) => item.id === id)

      if (!link) return

      Object.assign(link, changes, {
        updatedAt: new Date().toISOString(),
      })
    },

    deleteLink: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    setLinkFilters: (state, action: PayloadAction<Partial<ILinkFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    resetLinkFilters: (state) => {
      state.filters = initialState.filters
    },

    hydrateLinks(state, action: PayloadAction<ILink[]>) {
      state.items = action.payload
    },
  },
})
//#endregion slice

//#region exports
export const { addLink, updateLink, deleteLink, setLinkFilters, resetLinkFilters, hydrateLinks } =
  linkSlice.actions

export default linkSlice.reducer
//#endregion exports

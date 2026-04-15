import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ILink, ILinkFilters, ILinksState } from '../../types/linkTypes'

const initialState: ILinksState = {
  items: [],
  filters: {
    category: 'all',
    keyword: '',
  },
}

type UpdateLinkPayload = {
  id: string
  changes: Partial<Omit<ILink, 'id' | 'createdAt'>>
}

const linkSlice = createSlice({
  name: 'links',
  initialState,
  reducers: {
    addLink(state, action: PayloadAction<ILink>) {
      state.items.unshift(action.payload)
    },

    updateLink(state, action: PayloadAction<UpdateLinkPayload>) {
      const link = state.items.find((item) => item.id === action.payload.id)

      if (!link) return

      Object.assign(link, action.payload.changes, {
        updatedAt: new Date().toISOString(),
      })
    },

    deleteLink(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    setLinkFilters(state, action: PayloadAction<Partial<ILinkFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    resetLinkFilters(state) {
      state.filters = initialState.filters
    },

    hydrateLinks(state, action: PayloadAction<ILink[]>) {
      state.items = action.payload
    },
  },
})

export const { addLink, updateLink, deleteLink, setLinkFilters, resetLinkFilters, hydrateLinks } =
  linkSlice.actions

export default linkSlice.reducer
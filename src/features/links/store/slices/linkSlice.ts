import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type LinkCategory = 'general' | 'work' | 'study' | 'personal'

export interface Link {
  id: string
  title: string
  url: string
  description?: string
  category: LinkCategory
  createdAt: string
  updatedAt: string
}

export interface LinkFilters {
  category: 'all' | LinkCategory
  keyword: string
}

export interface LinksState {
  items: Link[]
  filters: LinkFilters
}

const initialState: LinksState = {
  items: [],
  filters: {
    category: 'all',
    keyword: '',
  },
}

type UpdateLinkPayload = {
  id: string
  changes: Partial<Omit<Link, 'id' | 'createdAt'>>
}

const linkSlice = createSlice({
  name: 'links',
  initialState,
  reducers: {
    addLink(state, action: PayloadAction<Link>) {
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
    setLinkFilters(state, action: PayloadAction<Partial<LinkFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },
    resetLinkFilters(state) {
      state.filters = initialState.filters
    },
  },
})

export const { addLink, updateLink, deleteLink, setLinkFilters, resetLinkFilters } =
  linkSlice.actions

export default linkSlice.reducer
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type LinkCategory = 'all' | 'general' | 'work' | 'study' | 'personal'

export interface ILink {
  id: string
  title: string
  url: string
  description?: string
  category: LinkCategory
  createdAt: string
  updatedAt: string
}

export interface ILinkFilters {
  category: 'all' | LinkCategory
  keyword: string
}

export interface ILinksState {
  items: ILink[]
  filters: ILinkFilters
}

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
  },
})

export const { addLink, updateLink, deleteLink, setLinkFilters, resetLinkFilters } =
  linkSlice.actions

export default linkSlice.reducer
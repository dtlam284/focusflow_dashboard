import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { INote, INoteFilters, INotesState } from '../../types/noteTypes'

const initialState: INotesState = {
  items: [],
  filters: {
    keyword: '',
    color: 'all',
    pinned: 'all',
  },
}

type TUpdateNotePayload = {
  id: string
  changes: Partial<Omit<INote, 'id' | 'createdAt'>>
}

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<INote>) {
      state.items.unshift(action.payload)
    },

    updateNote(state, action: PayloadAction<TUpdateNotePayload>) {
      const note = state.items.find((item) => item.id === action.payload.id)

      if (!note) return

      Object.assign(note, action.payload.changes, {
        updatedAt: new Date().toISOString(),
      })
    },

    deleteNote(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    togglePin(state, action: PayloadAction<string>) {
      const note = state.items.find((item) => item.id === action.payload)

      if (!note) return

      note.isPinned = !note.isPinned
      note.updatedAt = new Date().toISOString()
    },

    setNoteFilters(state, action: PayloadAction<Partial<INoteFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    resetNoteFilters(state) {
      state.filters = initialState.filters
    },

    hydrateNotes(state, action: PayloadAction<INote[]>) {
      state.items = action.payload
    },
  },
})

export const {
  addNote,
  updateNote,
  deleteNote,
  togglePin,
  setNoteFilters,
  resetNoteFilters,
  hydrateNotes,
} = noteSlice.actions

export default noteSlice.reducer
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type NoteColor = 'all' | 'default' | 'yellow' | 'blue' | 'green' | 'pink'

export interface INote {
  id: string
  title: string
  content: string
  color: NoteColor
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface INotesState {
  items: INote[]
}

const initialState: INotesState = {
  items: [],
}

type UpdateNotePayload = {
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
    updateNote(state, action: PayloadAction<UpdateNotePayload>) {
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
  },
})

export const { addNote, updateNote, deleteNote, togglePin } = noteSlice.actions
export default noteSlice.reducer
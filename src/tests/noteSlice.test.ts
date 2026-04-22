import { describe, expect, it } from 'vitest'

import type { RootState } from '@/app/store/store'
import {
  selectFilteredNotes,
  selectFilteredPinnedNotes,
  selectFilteredUnpinnedNotes,
} from '@/features/notes/store/selectors/noteSelectors'
import noteReducer, {
  addNote,
  deleteNote,
  resetNoteFilters,
  setNoteFilters,
  togglePinNote,
  updateNote,
} from '@/features/notes/store/slices/noteSlice'
import type { INote, INotesState } from '@/features/notes/types/noteTypes'

//#region helpers
const createNote = (overrides: Partial<INote> = {}): INote => ({
  id: 'note-1',
  title: 'Redux notes',
  content: 'Remember selectors',
  color: 'yellow',
  category: 'learning',
  isPinned: false,
  createdAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-04-12T00:00:00.000Z',
  ...overrides,
})

const createNotesState = (overrides: Partial<INotesState> = {}): INotesState => ({
  items: overrides.items ?? [],
  filters: {
    keyword: '',
    ...(overrides.filters ?? {}),
  },
})

const createRootState = (notes: INotesState): RootState =>
  ({
    app: {
      initialized: false,
      pageTitle: '',
      isSidebarCollapsed: false,
    },
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSubmitting: false,
      error: null,
    },
    tasks: {
      items: [],
      filters: {
        status: 'all',
        priority: 'all',
        keyword: '',
        labelId: 'all',
      },
    },
    taskDetail: {
      selectedTaskId: null,
      isOpen: false,
    },
    taskComments: {
      byTaskId: {},
    },
    taskActivity: {
      items: [],
    },
    taskLabels: {
      items: [],
    },
    notes,
    links: {
      items: [],
      filters: {
        keyword: '',
        category: 'all',
      },
    },
    _persist: {
      version: -1,
      rehydrated: true,
    },
  }) as RootState
//#endregion helpers

//#region tests
describe('noteSlice', () => {
  it('adds a note', () => {
    const initialState = createNotesState()

    const nextState = noteReducer(initialState, addNote(createNote()))

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0]?.title).toBe('Redux notes')
  })

  it('updates a note', () => {
    const initialState = createNotesState({
      items: [createNote()],
    })

    const nextState = noteReducer(
      initialState,
      updateNote({
        id: 'note-1',
        changes: {
          title: 'Updated Redux notes',
          color: 'blue',
        },
      }),
    )

    expect(nextState.items[0]?.title).toBe('Updated Redux notes')
    expect(nextState.items[0]?.color).toBe('blue')
  })

  it('deletes a note', () => {
    const initialState = createNotesState({
      items: [createNote()],
    })

    const nextState = noteReducer(initialState, deleteNote('note-1'))

    expect(nextState.items).toHaveLength(0)
  })

  it('toggles pin state', () => {
    const initialState = createNotesState({
      items: [createNote({ isPinned: false })],
    })

    const nextState = noteReducer(initialState, togglePinNote('note-1'))

    expect(nextState.items[0]?.isPinned).toBe(true)
  })

  it('sets note filters', () => {
    const initialState = createNotesState()

    const nextState = noteReducer(
      initialState,
      setNoteFilters({
        keyword: 'redux',
      }),
    )

    expect(nextState.filters.keyword).toBe('redux')
  })

  it('resets note filters', () => {
    const initialState = createNotesState({
      filters: {
        keyword: 'redux',
      },
    })

    const nextState = noteReducer(initialState, resetNoteFilters())

    expect(nextState.filters).toEqual({
      keyword: '',
    })
  })

  it('returns filtered notes by keyword', () => {
    const notesState = createNotesState({
      items: [
        createNote({
          id: 'note-1',
          title: 'Redux notes',
          isPinned: true,
        }),
        createNote({
          id: 'note-2',
          title: 'Tailwind notes',
          isPinned: false,
        }),
      ],
      filters: {
        keyword: 'redux',
      },
    })

    const state = createRootState(notesState)
    const result = selectFilteredNotes(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('note-1')
  })

  it('returns filtered pinned and unpinned notes', () => {
    const notesState = createNotesState({
      items: [
        createNote({ id: 'note-1', isPinned: true }),
        createNote({ id: 'note-2', isPinned: false }),
      ],
    })

    const state = createRootState(notesState)

    expect(selectFilteredPinnedNotes(state)).toHaveLength(1)
    expect(selectFilteredUnpinnedNotes(state)).toHaveLength(1)
  })
})
//#endregion tests

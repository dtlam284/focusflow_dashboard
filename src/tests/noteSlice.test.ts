import { describe, expect, it } from 'vitest'

import { selectFilteredNotes, selectPinnedNotes, selectUnpinnedNotes, } from '@/features/notes/store/selectors/noteSelectors'
import noteReducer, { addNote, deleteNote, resetNoteFilters, setNoteFilters, togglePin, updateNote, } from '@/features/notes/store/slices/noteSlice'

import type { RootState } from '@/app/store/store'
import type { INote, INotesState } from '@/features/notes/types/noteTypes'

const createNote = (overrides: Partial<INote> = {}): INote => ({
  id: 'note-1',
  title: 'Redux notes',
  content: 'Remember selectors',
  color: 'yellow',
  isPinned: false,
  createdAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-04-12T00:00:00.000Z',
  ...overrides,
})

const createNotesState = (overrides: Partial<INotesState> = {}): INotesState => ({
  items: [],
  filters: {
    keyword: '',
    color: 'all',
    pinned: 'all',
  },
  ...overrides,
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
      },
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

    const nextState = noteReducer(initialState, togglePin('note-1'))

    expect(nextState.items[0]?.isPinned).toBe(true)
  })

  it('sets note filters', () => {
    const initialState = createNotesState()

    const nextState = noteReducer(
      initialState,
      setNoteFilters({
        keyword: 'redux',
        color: 'yellow',
        pinned: 'pinned',
      }),
    )

    expect(nextState.filters.keyword).toBe('redux')
    expect(nextState.filters.color).toBe('yellow')
    expect(nextState.filters.pinned).toBe('pinned')
  })

  it('resets note filters', () => {
    const initialState = createNotesState({
      filters: {
        keyword: 'redux',
        color: 'yellow',
        pinned: 'pinned',
      },
    })

    const nextState = noteReducer(initialState, resetNoteFilters())

    expect(nextState.filters).toEqual({
      keyword: '',
      color: 'all',
      pinned: 'all',
    })
  })
})

describe('noteSelectors', () => {
  it('returns filtered notes', () => {
    const notesState = createNotesState({
      items: [
        createNote({
          id: 'note-1',
          title: 'Redux notes',
          color: 'yellow',
          isPinned: true,
        }),
        createNote({
          id: 'note-2',
          title: 'Tailwind notes',
          color: 'blue',
          isPinned: false,
        }),
      ],
      filters: {
        keyword: 'redux',
        color: 'yellow',
        pinned: 'pinned',
      },
    })

    const state = createRootState(notesState)
    const result = selectFilteredNotes(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('note-1')
  })

  it('returns pinned and unpinned notes', () => {
    const notesState = createNotesState({
      items: [
        createNote({ id: 'note-1', isPinned: true }),
        createNote({ id: 'note-2', isPinned: false }),
      ],
    })

    const state = createRootState(notesState)

    expect(selectPinnedNotes(state)).toHaveLength(1)
    expect(selectUnpinnedNotes(state)).toHaveLength(1)
  })
})
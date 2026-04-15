import type { RootState } from '../../../../app/store/store'
import type { INote } from '../../types/noteTypes'

export const selectNoteState = (state: RootState) => state.notes
export const selectNoteItems = (state: RootState) => state.notes.items
export const selectNoteFilters = (state: RootState) => state.notes.filters

export const selectFilteredNotes = (state: RootState): INote[] => {
  const { items, filters } = state.notes
  const keyword = filters.keyword.trim().toLowerCase()

  return items.filter((note) => {
    const matchesKeyword =
      keyword.length === 0 ||
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)

    const matchesColor =
      filters.color === 'all' || note.color === filters.color

    const matchesPinned =
      filters.pinned === 'all' ||
      (filters.pinned === 'pinned' && note.isPinned) ||
      (filters.pinned === 'unpinned' && !note.isPinned)

    return matchesKeyword && matchesColor && matchesPinned
  })
}

export const selectPinnedNotes = (state: RootState) =>
  state.notes.items.filter((note) => note.isPinned)

export const selectUnpinnedNotes = (state: RootState) =>
  state.notes.items.filter((note) => !note.isPinned)
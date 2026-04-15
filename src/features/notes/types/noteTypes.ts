export type NoteColor = 'all' | 'default' | 'yellow' | 'blue' | 'green' | 'pink'
export type NotePinnedFilter = 'all' | 'pinned' | 'unpinned'

export type NoteItemColor = Exclude<NoteColor, 'all'>

export interface INote {
  id: string
  title: string
  content: string
  color: NoteItemColor
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface INoteFilters {
  keyword: string
  color: NoteColor
  pinned: NotePinnedFilter
}

export interface INotesState {
  items: INote[]
  filters: INoteFilters
}

export interface ICreateNoteFormValues {
  title: string
  content: string
  color: NoteItemColor
}

export interface IUpdateNoteFormValues {
  title: string
  content: string
  color: NoteItemColor
  isPinned: boolean
}
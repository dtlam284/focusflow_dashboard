export type NoteColor = 'all' | 'default' | 'yellow' | 'blue' | 'green' | 'pink';

export interface INote {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INoteFilters {
  keyword: string;
  color: NoteColor;
  pinned: 'pinned' | 'unpinned';
}

export interface INotesState {
  items: INote[];
  filters: INoteFilters;
}

export interface ICreateNoteFormValues {
  title: string;
  content: string;
  color: NoteColor;
}

export interface IUpdateNoteFormValues {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
}
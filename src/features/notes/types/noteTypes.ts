export type NoteColor = "default" | "yellow" | "blue" | "green" | "pink";

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFilters {
  keyword: string;
  color: "all" | NoteColor;
  pinned: "all" | "pinned" | "unpinned";
}

export interface NotesState {
  items: Note[];
  filters: NoteFilters;
}

export interface CreateNoteFormValues {
  title: string;
  content: string;
  color: NoteColor;
}

export interface UpdateNoteFormValues {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
}
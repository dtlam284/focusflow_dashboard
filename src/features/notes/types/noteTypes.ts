export const NOTE_COLOR_OPTIONS = [
  "default",
  "blue",
  "green",
  "yellow",
  "rose",
  "violet",
] as const;

export const NOTE_CATEGORY_OPTIONS = [
  "work",
  "personal",
  "idea",
  "learning",
  "other",
] as const;

export type NoteColor = (typeof NOTE_COLOR_OPTIONS)[number];
export type NoteCategory = (typeof NOTE_CATEGORY_OPTIONS)[number];

export interface INote {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  category: NoteCategory;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INoteFilters {
  keyword: string;
}

export interface INotesState {
  items: INote[];
  filters: INoteFilters;
}

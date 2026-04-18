
export type NoteColor =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "rose"
  | "violet";

export type NoteCategory =
  | "work"
  | "personal"
  | "idea"
  | "learning"
  | "other";

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

export interface INotesState {
  items: INote[];
}

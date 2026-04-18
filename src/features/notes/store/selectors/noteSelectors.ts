import type { RootState } from "@/app/store/store";
import type { INote } from "../../types/noteTypes";

//#region based selectors
export const selectNoteState = (state: RootState) => state.notes;
export const selectNoteItems = (state: RootState) => state.notes.items;
export const selectHasNotes = (state: RootState) => state.notes.items.length > 0;
//#endregion based selectors

//#region filtered selectors
export const selectPinnedNotes = (state: RootState): INote[] =>
  state.notes.items.filter((note) => note.isPinned);

export const selectUnpinnedNotes = (state: RootState): INote[] =>
  state.notes.items.filter((note) => !note.isPinned);
//#endregion filtered selectors

//#region ordered selectors
export const selectOrderedNotes = (state: RootState): INote[] => {
  const pinned = state.notes.items.filter((note) => note.isPinned);
  const unpinned = state.notes.items.filter((note) => !note.isPinned);

  return [...pinned, ...unpinned];
};
//#endregion ordered selectors

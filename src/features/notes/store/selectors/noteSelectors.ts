import type { RootState } from "@/app/store/store";
import type { INote } from "../../types/noteTypes";

//#region base selectors
export const selectNoteState = (state: RootState) => state.notes;
export const selectNoteItems = (state: RootState) => state.notes.items;
export const selectNoteFilters = (state: RootState) => state.notes.filters;
export const selectHasNotes = (state: RootState) => state.notes.items.length > 0;
//#endregion base selectors

//#region filtered selectors
export const selectFilteredNotes = (state: RootState): INote[] => {
  const { items, filters } = state.notes;
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((note) => {
    const matchesKeyword =
      keyword.length === 0 ||
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword);

    return matchesKeyword;
  });
};

export const selectFilteredPinnedNotes = (state: RootState): INote[] =>
  selectFilteredNotes(state).filter((note) => note.isPinned);

export const selectFilteredUnpinnedNotes = (state: RootState): INote[] =>
  selectFilteredNotes(state).filter((note) => !note.isPinned);
//#endregion filtered selectors

//#region ordered selectors
export const selectOrderedNotes = (state: RootState): INote[] => {
  const filtered = selectFilteredNotes(state);
  const pinned = filtered.filter((note) => note.isPinned);
  const unpinned = filtered.filter((note) => !note.isPinned);

  return [...pinned, ...unpinned];
};
//#endregion ordered selectors

//#region metrics selectors
export const selectPinnedNotesCount = (state: RootState) =>
  state.notes.items.filter((note) => note.isPinned).length;

export const selectNotesCount = (state: RootState) => 
  state.notes.items.length;

export const selectFilteredNotesCount = (state: RootState) =>
  selectFilteredNotes(state).length;
//#endregion metrics selectors

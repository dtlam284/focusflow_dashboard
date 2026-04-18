import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { INote, INotesState } from "../../types/noteTypes";

//#region state
const initialState: INotesState = {
  items: [],
};
//endregion state

//#region payload types
type UpdateNotePayload = {
  id: string;
  changes: Partial<Omit<INote, "id" | "createdAt">>;
};
//endregion payload types

//#region slice
const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<INote>) {
      state.items.unshift(action.payload);
    },

    updateNote(state, action: PayloadAction<UpdateNotePayload>) {
      const { id, changes } = action.payload;

      state.items = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
    },

    deleteNote(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    togglePinNote(state, action: PayloadAction<string>) {
      state.items = state.items.map((item) =>
        item.id === action.payload
          ? {
              ...item,
              isPinned: !item.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : item,
      );
    },

    hydrateNotes(state, action: PayloadAction<INote[]>) {
      state.items = action.payload;
    },
  },
});
//endregion slice

//#region exports
export const {
  addNote,
  updateNote,
  deleteNote,
  togglePinNote,
  hydrateNotes,
} = noteSlice.actions;

export default noteSlice.reducer;
//#endregion exports

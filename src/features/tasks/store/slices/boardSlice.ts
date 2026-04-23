import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

//#region types
export type BoardSortMode = 'newest' | 'oldest'
export type BoardGroupMode = 'status' | 'label'

export interface IBoardState {
  showCompleted: boolean
  sortMode: BoardSortMode
  groupMode: BoardGroupMode
}
//#endregion types

//#region state
const initialState: IBoardState = {
  showCompleted: true,
  sortMode: 'newest',
  groupMode: 'status',
}
//#endregion state

//#region slice
const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    hydrateBoardPreferences(
      _state,
      action: PayloadAction<Partial<IBoardState>>,
    ) {
      return {
        ...initialState,
        ...action.payload,
      }
    },

    setShowCompleted(state, action: PayloadAction<boolean>) {
      state.showCompleted = action.payload
    },

    setSortMode(state, action: PayloadAction<BoardSortMode>) {
      state.sortMode = action.payload
    },

    setGroupMode(state, action: PayloadAction<BoardGroupMode>) {
      state.groupMode = action.payload
    },

    resetBoardPreferences() {
      return initialState
    },
  },
})
//#endregion slice

//#region exports
export const {
  hydrateBoardPreferences,
  setShowCompleted,
  setSortMode,
  setGroupMode,
  resetBoardPreferences,
} = boardSlice.actions

export default boardSlice.reducer
//#endregion exports

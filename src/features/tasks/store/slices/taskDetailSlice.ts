import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

//#region types
export interface ITaskDetailState {
    selectedTaskId: string | null;
    isOpen: boolean;
}
//#endregion types

//#region state
const initialState: ITaskDetailState = {
    selectedTaskId: null,
    isOpen: false,
};
//#endregion state

//#region slice
const taskDetailSlice = createSlice({
    name: 'taskDetail',
    initialState,
    reducers: {
        openTaskDetail(state, action: PayloadAction<string>) {
            state.selectedTaskId = action.payload;
            state.isOpen = true;
        },

        closeTaskDetail(state) {
            state.selectedTaskId = null;
            state.isOpen = false;
        },

        setSelectedTaskId(state, action: PayloadAction<string | null>) {
            state.selectedTaskId = action.payload;
        },
    },
});
//#endregion slice

//#region exports
export const {
    openTaskDetail,
    closeTaskDetail,
    setSelectedTaskId,
} = taskDetailSlice.actions;

export default taskDetailSlice.reducer;
//#endregion exports

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ITaskComment, ITaskCommentsState } from '../../types/taskTypes';

//#region state
const initialState: ITaskCommentsState = {
    byTaskId: {},
};
//#endregion state

//#region slice
const taskCommentsSlice = createSlice({
    name: 'taskComments',
    initialState,
    reducers: {
        addTaskComment(state, action: PayloadAction<ITaskComment>) {
            const comment = action.payload;
            const existingComments = state.byTaskId[comment.taskId];

            if (existingComments) {
                existingComments.unshift(comment);
                return;
            }

            state.byTaskId[comment.taskId] = [comment];
        },

        removeCommentsByTaskId(state, action: PayloadAction<string>) {
            delete state.byTaskId[action.payload];
        },

        hydrateTaskComments(
            state,
            action: PayloadAction<Record<string, ITaskComment[]>>,
        ) {
            state.byTaskId = action.payload ?? {};
        },
    },
});
//#endregion slice

//#region exports
export const {
    addTaskComment,
    removeCommentsByTaskId,
    hydrateTaskComments,
} = taskCommentsSlice.actions;

export default taskCommentsSlice.reducer;
//#endregion exports

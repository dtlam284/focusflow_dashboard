import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/store'

import type { ITaskComment } from '../../types/taskTypes'

//#region constants
const EMPTY_COMMENTS: ITaskComment[] = []
//#endregion constants

//#region base selectors
export const selectTaskCommentsState = (state: RootState) => state.taskComments
//#endregion base selectors

//#region derived selectors
export const selectCommentsByTaskId = createSelector(
  [
    selectTaskCommentsState,
    (_state: RootState, taskId: string | null) => taskId,
  ],
  (taskCommentsState, taskId): ITaskComment[] => {
    if (!taskId) {
      return EMPTY_COMMENTS
    }

    return taskCommentsState.byTaskId[taskId] ?? EMPTY_COMMENTS
  },
)

export const selectCommentCountByTaskId = createSelector(
  [
    selectTaskCommentsState,
    (_state: RootState, taskId: string | null) => taskId,
  ],
  (taskCommentsState, taskId): number => {
    if (!taskId) {
      return 0
    }

    return taskCommentsState.byTaskId[taskId]?.length ?? 0
  },
)
//#endregion derived selectors

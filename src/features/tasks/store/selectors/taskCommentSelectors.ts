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

export const selectRootCommentsByTaskId = createSelector(
  [selectCommentsByTaskId],
  (comments): ITaskComment[] => comments.filter((comment) => !comment.parentId),
)

export const selectRepliesByParentId = createSelector(
  [
    selectCommentsByTaskId,
    (_state: RootState, _taskId: string | null, parentId: string | null) =>
      parentId,
  ],
  (comments, parentId): ITaskComment[] => {
    if (!parentId) {
      return EMPTY_COMMENTS
    }

    const parentComment = comments.find((comment) => comment.id === parentId)

    if (!parentComment || parentComment.parentId) {
      return EMPTY_COMMENTS
    }

    return comments.filter((comment) => comment.parentId === parentId)
  },
)

export const selectCommentCountByTaskId = createSelector(
  [selectCommentsByTaskId],
  (comments): number => comments.length,
)
//#endregion derived selectors

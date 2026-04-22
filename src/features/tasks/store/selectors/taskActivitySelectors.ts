import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/store'

import type {
  ITaskActivitiesState,
  ITaskActivity,
} from '../../types/taskTypes'

//#region constants
const EMPTY_ACTIVITIES: ITaskActivity[] = []
const EMPTY_ACTIVITY_STATE: ITaskActivitiesState = {
  items: [],
}
//#endregion constants

//#region compatibility type
type RootStateWithTaskActivity = RootState & {
  taskActivity?: ITaskActivitiesState
}
//#endregion compatibility type

//#region base selectors
export const selectTaskActivitiesState = (
  state: RootState,
): ITaskActivitiesState =>
  (state as RootStateWithTaskActivity).taskActivity ?? EMPTY_ACTIVITY_STATE
//#endregion base selectors

//#region derived selectors
export const selectActivitiesByTaskId = createSelector(
  [
    selectTaskActivitiesState,
    (_state: RootState, taskId: string | null) => taskId,
  ],
  (taskActivitiesState, taskId): ITaskActivity[] => {
    if (!taskId) {
      return EMPTY_ACTIVITIES
    }

    return taskActivitiesState.items
      .filter((activity: ITaskActivity) => activity.taskId === taskId)
      .sort(
        (left: ITaskActivity, right: ITaskActivity) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
  },
)

export const selectTaskActivityCountByTaskId = createSelector(
  [selectActivitiesByTaskId],
  (activities): number => activities.length,
)
//#endregion derived selectors

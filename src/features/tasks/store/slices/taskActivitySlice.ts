import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ITaskActivitiesState, ITaskActivity } from '../../types/taskTypes'

//#region state
const initialState: ITaskActivitiesState = {
  items: [],
}
//#endregion state

//#region slice
const taskActivitySlice = createSlice({
  name: 'taskActivity',
  initialState,
  reducers: {
    addTaskActivity(state, action: PayloadAction<ITaskActivity>) {
      state.items.unshift(action.payload)
    },

    removeActivitiesByTaskId(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (activity) => activity.taskId !== action.payload,
      )
    },

    hydrateTaskActivities(state, action: PayloadAction<ITaskActivity[]>) {
      state.items = action.payload ?? []
    },
  },
})
//#endregion slice

//#region exports
export const {
  addTaskActivity,
  removeActivitiesByTaskId,
  hydrateTaskActivities,
} = taskActivitySlice.actions

export default taskActivitySlice.reducer
//#endregion exports

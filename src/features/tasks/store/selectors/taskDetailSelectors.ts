import type { RootState } from '@/app/store/store'

//#region base selectors
export const selectTaskDetailState = (state: RootState) => state.taskDetail

export const selectIsTaskDetailOpen = (state: RootState) =>
  state.taskDetail.isOpen

export const selectSelectedTaskId = (state: RootState) =>
  state.taskDetail.selectedTaskId
//#endregion base selectors

//#region derived selectors
export const selectSelectedTaskDetail = (state: RootState) => {
  const selectedTaskId = state.taskDetail.selectedTaskId

  if (!selectedTaskId) {
    return null
  }

  return state.tasks.items.find((task) => task.id === selectedTaskId) ?? null
}
//#endregion derived selectors

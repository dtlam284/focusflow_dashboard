import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/store'

import type {
  ITask,
  ITaskBoardColumn,
  TaskComputedStatus,
  TaskStatus,
} from '../../types/taskTypes'

//#region helpers
const sortTasksByOrder = (tasks: ITask[]) =>
  [...tasks].sort((left, right) => left.order - right.order)

export const getTaskIsUnfinished = (task: ITask) => {
  if (task.status === 'done') {
    return false
  }

  if (!task.dueDate) {
    return true
  }

  const deadline = new Date(
    `${task.dueDate}T${task.dueTime && task.dueTime.trim() ? task.dueTime : '23:59'}`,
  )

  if (Number.isNaN(deadline.getTime())) {
    return true
  }

  return deadline.getTime() < Date.now()
}

export const getTaskEffectiveStatus = (task: ITask): TaskComputedStatus => {
  if (getTaskIsUnfinished(task)) {
    return 'unfinished'
  }

  return task.status
}
//#endregion helpers

//#region base selectors
export const selectTaskState = (state: RootState) => state.tasks
export const selectTaskItems = (state: RootState) => state.tasks.items
export const selectTaskFilters = (state: RootState) => state.tasks.filters
//#endregion base selectors

//#region derived selectors
export const selectFilteredTasks = createSelector(
  [selectTaskItems, selectTaskFilters],
  (items, filters) => {
    const normalizedKeyword = filters.keyword.trim().toLowerCase()

    return sortTasksByOrder(
      items.filter((task: ITask) => {
        const effectiveStatus = getTaskEffectiveStatus(task)

        const matchesStatus =
          filters.status === 'all' || effectiveStatus === filters.status

        const matchesPriority =
          filters.priority === 'all' || task.priority === filters.priority

        const matchesKeyword =
          normalizedKeyword.length === 0 ||
          task.title.toLowerCase().includes(normalizedKeyword) ||
          task.description?.toLowerCase().includes(normalizedKeyword)

        const matchesLabel =
          filters.labelId === 'all' || task.labelIds.includes(filters.labelId)

        return (
          matchesStatus &&
          matchesPriority &&
          matchesKeyword &&
          matchesLabel
        )
      }),
    )
  },
)

export const selectTasksByStatus = createSelector(
  [selectTaskItems, (_state: RootState, status: TaskStatus) => status],
  (items, status) =>
    sortTasksByOrder(items.filter((task: ITask) => task.status === status)),
)

export const selectTaskBoardColumns = createSelector([selectFilteredTasks], (tasks) => {
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

  return statuses.map<ITaskBoardColumn>((status) => ({
    status,
    tasks: sortTasksByOrder(tasks.filter((task: ITask) => task.status === status)),
  }))
})

export const selectTotalTaskCount = createSelector(
  [selectTaskItems],
  (items) => items.length,
)

export const selectCompletedTaskCount = createSelector(
  [selectTaskItems],
  (items) => items.filter((task: ITask) => task.status === 'done').length,
)

export const selectPendingTaskCount = createSelector(
  [selectTaskItems],
  (items) => items.filter((task: ITask) => task.status !== 'done').length,
)

export const selectUnfinishedTaskCount = createSelector(
  [selectTaskItems],
  (items) => items.filter((task: ITask) => getTaskIsUnfinished(task)).length,
)
//#endregion derived selectors

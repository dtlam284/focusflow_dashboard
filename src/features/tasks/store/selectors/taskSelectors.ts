import type { RootState } from '@/app/store/store'
import {
  TASK_STATUSES,
  type ITask,
  type ITaskBoardColumn,
  type TaskComputedStatus,
  type TaskStatus,
} from '../../types/taskTypes'

//#region base selectors
export const selectTaskState = (state: RootState) => state.tasks
export const selectTaskItems = (state: RootState) => state.tasks.items
export const selectTaskFilters = (state: RootState) => state.tasks.filters
//#endregion base selectors

//#region helpers
const sortTasksByOrder = (tasks: ITask[]): ITask[] => {
  return [...tasks].sort((a, b) => a.order - b.order)
}

const getTaskDeadline = (task: ITask) => {
  if (!task.dueDate) return null

  const time = task.dueTime?.trim() || '23:59'
  return new Date(`${task.dueDate}T${time}:00`)
}

export const getTaskIsUnfinished = (task: ITask): boolean => {
  if (task.status === 'done') return false

  const deadline = getTaskDeadline(task)
  if (!deadline || Number.isNaN(deadline.getTime())) return false

  return deadline < new Date()
}

export const getTaskEffectiveStatus = (task: ITask): TaskComputedStatus => {
  if (getTaskIsUnfinished(task)) return 'unfinished'
  return task.status
}
//#endregion helpers

//#region filtered selectors
export const selectFilteredTasks = (state: RootState): ITask[] => {
  const { items, filters } = state.tasks
  const keyword = filters.keyword.trim().toLowerCase()

  return items.filter((task) => {
    const effectiveStatus = getTaskEffectiveStatus(task)

    const matchesStatus = filters.status === 'all' || effectiveStatus === filters.status

    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority

    const matchesKeyword =
      keyword.length === 0 ||
      task.title.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword)

    return matchesStatus && matchesPriority && matchesKeyword
  })
}

export const selectTasksByStatus = (state: RootState, status: TaskStatus): ITask[] => {
  return sortTasksByOrder(state.tasks.items.filter((task) => task.status === status))
}

export const selectKanbanColumns = (state: RootState): ITaskBoardColumn[] => {
  return TASK_STATUSES.map((status) => ({
    status,
    tasks: sortTasksByOrder(state.tasks.items.filter((task) => task.status === status)),
  }))
}
//#endregion filtered selectors

//#region metrics selectors
export const selectTotalTaskCount = (state: RootState) => state.tasks.items.length

export const selectCompletedTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => task.status === 'done').length

export const selectPendingTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => task.status !== 'done').length

export const selectUnfinishedTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => getTaskIsUnfinished(task)).length
//#endregion metrics selectors

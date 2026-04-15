import type { ITask } from '../../types/taskTypes'
import type { RootState } from '../../../../app/store/store'

export const selectTaskState = (state: RootState) => state.tasks
export const selectTaskItems = (state: RootState) => state.tasks.items
export const selectTaskFilters = (state: RootState) => state.tasks.filters

export const selectFilteredTasks = (state: RootState): ITask[] => {
  const { items, filters } = state.tasks
  const keyword = filters.keyword.trim().toLowerCase()

  return items.filter((task) => {
    const matchesStatus =
      filters.status === 'all' || task.status === filters.status

    const matchesPriority =
      filters.priority === 'all' || task.priority === filters.priority

    const matchesKeyword =
      keyword.length === 0 ||
      task.title.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword)

    return matchesStatus && matchesPriority && matchesKeyword
  })
}

export const selectCompletedTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => task.status === 'done').length

export const selectPendingTaskCount = (state: RootState) =>
  state.tasks.items.filter((task) => task.status !== 'done').length
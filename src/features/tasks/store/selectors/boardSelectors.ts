import { createSelector } from '@reduxjs/toolkit'
import { selectLabelItems } from './labelSelectors'
import { selectFilteredTasks } from './taskSelectors'
import type { RootState } from '@/app/store/store'
import type { ITask, TaskStatus } from '../../types/taskTypes'

//#region types
export interface IBoardLabelGroupColumn {
  id: string
  title: string
  color: string
  tasks: ITask[]
  kind: 'label' | 'unlabeled'
}
//#endregion types

//#region helpers
const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

const getTimestamp = (value: string) => {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortTasksByCreatedAt = (
  tasks: ITask[],
  sortMode: 'newest' | 'oldest',
): ITask[] => {
  return tasks.slice().sort((left, right) => {
    const leftTimestamp = getTimestamp(left.createdAt)
    const rightTimestamp = getTimestamp(right.createdAt)

    return sortMode === 'newest'
      ? rightTimestamp - leftTimestamp
      : leftTimestamp - rightTimestamp
  })
}
//#endregion helpers

//#region base selectors
export const selectBoardState = (state: RootState) => state.board

export const selectShowCompleted = (state: RootState) =>
  state.board.showCompleted

export const selectSortMode = (state: RootState) => state.board.sortMode

export const selectGroupMode = (state: RootState) => state.board.groupMode
//#endregion base selectors

//#region shared derived selectors
const selectBoardBaseTasks = createSelector(
  [selectFilteredTasks, selectShowCompleted, selectSortMode],
  (filteredTasks, showCompleted, sortMode): ITask[] => {
    const visibleTasks = showCompleted
      ? filteredTasks
      : filteredTasks.filter((task) => task.status !== 'done')

    return sortTasksByCreatedAt(visibleTasks, sortMode)
  },
)
//#endregion shared derived selectors

//#region status mode selectors
export const selectBoardVisibleTasks = createSelector(
  [selectBoardBaseTasks],
  (boardBaseTasks): ITask[] => {
    return STATUS_ORDER.flatMap((status) => {
      const tasksInStatus = boardBaseTasks
        .filter((task) => task.status === status)
        .map((task, index) => ({
          ...task,
          order: index,
        }))

      return tasksInStatus
    })
  },
)
//#endregion status mode selectors

//#region label mode selectors
export const selectLabelGroupedColumns = createSelector(
  [selectBoardBaseTasks, selectLabelItems],
  (boardBaseTasks, labels): IBoardLabelGroupColumn[] => {
    const labelMap = new Map(labels.map((label) => [label.id, label]))

    const getPrimaryLabelId = (task: ITask): string | null => {
      return task.labelIds.find((labelId) => labelMap.has(labelId)) ?? null
    }

    const columns: IBoardLabelGroupColumn[] = labels.map((label) => ({
      id: label.id,
      title: label.name,
      color: label.color,
      kind: 'label',
      tasks: boardBaseTasks
        .filter((task) => getPrimaryLabelId(task) === label.id)
        .map((task, index) => ({
          ...task,
          order: index,
        })),
    }))

    const unlabeledTasks = boardBaseTasks
      .filter((task) => getPrimaryLabelId(task) === null)
      .map((task, index) => ({
        ...task,
        order: index,
      }))

    if (unlabeledTasks.length > 0) {
      columns.push({
        id: 'unlabeled',
        title: 'Unlabeled',
        color: 'slate',
        kind: 'unlabeled',
        tasks: unlabeledTasks,
      })
    }

    return columns
  },
)
//#endregion label mode selectors

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type {
  ITask,
  ITasksState,
  TaskFilterPriority,
  TaskFilterStatus,
  TaskStatus,
} from '../../types/taskTypes'

//#region helpers
const getNormalizedLabelIds = (labelIds: string[] | undefined): string[] => {
  if (!labelIds?.length) {
    return []
  }

  return Array.from(new Set(labelIds))
}

const normalizeTaskOrdersByStatus = (tasks: ITask[]): ITask[] => {
  return ['todo', 'in_progress', 'review', 'done'].flatMap((status) =>
    tasks
      .filter((task) => task.status === status)
      .sort((left, right) => left.order - right.order)
      .map((task, index) => ({
        ...task,
        order: index,
      })),
  )
}
//#endregion helpers

//#region state
const initialState: ITasksState = {
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
    labelId: 'all',
  },
}
//#endregion state

//#region slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    hydrateTasks(state, action: PayloadAction<ITask[]>) {
      state.items = normalizeTaskOrdersByStatus(
        action.payload.map((task) => ({
          ...task,
          labelIds: getNormalizedLabelIds(task.labelIds),
        })),
      )
    },

    addTask(state, action: PayloadAction<ITask>) {
      const nextTask = action.payload
      const targetColumnTasks = state.items.filter(
        (task) => task.status === nextTask.status,
      )

      state.items.push({
        ...nextTask,
        labelIds: getNormalizedLabelIds(nextTask.labelIds),
        order: targetColumnTasks.length,
      })
    },

    updateTask(
      state,
      action: PayloadAction<{
        id: string
        changes: Partial<ITask>
      }>,
    ) {
      const { id, changes } = action.payload
      const existingTask = state.items.find((task) => task.id === id)

      if (!existingTask) {
        return
      }

      Object.assign(existingTask, {
        ...changes,
        labelIds:
          changes.labelIds !== undefined
            ? getNormalizedLabelIds(changes.labelIds)
            : existingTask.labelIds,
        updatedAt: changes.updatedAt ?? new Date().toISOString(),
      })
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.items = normalizeTaskOrdersByStatus(
        state.items.filter((task) => task.id !== action.payload),
      )
    },

    bulkDeleteTasks(state, action: PayloadAction<string[]>) {
      const taskIdsToDelete = new Set(action.payload)

      state.items = normalizeTaskOrdersByStatus(
        state.items.filter((task) => !taskIdsToDelete.has(task.id)),
      )
    },

    bulkUpdateTaskStatus(
      state,
      action: PayloadAction<{
        taskIds: string[]
        status: TaskStatus
      }>,
    ) {
      const { taskIds, status } = action.payload
      const taskIdSet = new Set(taskIds)
      const updatedAt = new Date().toISOString()

      const currentTargetTasks = state.items
        .filter((task) => task.status === status)
        .sort((left, right) => left.order - right.order)
        .map((task) =>
          taskIdSet.has(task.id)
            ? {
                ...task,
                updatedAt,
              }
            : task,
        )

      const movedTasks = state.items
        .filter((task) => taskIdSet.has(task.id) && task.status !== status)
        .map((task) => ({
          ...task,
          status,
          updatedAt,
        }))

      const normalizedOtherTasks = ['todo', 'in_progress', 'review', 'done']
        .filter((columnStatus) => columnStatus !== status)
        .flatMap((columnStatus) =>
          state.items
            .filter(
              (task) =>
                task.status === columnStatus && !taskIdSet.has(task.id),
            )
            .sort((left, right) => left.order - right.order)
            .map((task, index) => ({
              ...task,
              order: index,
            })),
        )

      const nextTargetTasks = [...currentTargetTasks, ...movedTasks].map(
        (task, index) => ({
          ...task,
          order: index,
        }),
      )

      state.items = [...normalizedOtherTasks, ...nextTargetTasks]
    },

    toggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload)

      if (!task) {
        return
      }

      const nextStatus = task.status === 'done' ? 'todo' : 'done'
      const nextOrder = state.items.filter(
        (item) => item.status === nextStatus,
      ).length

      task.status = nextStatus
      task.order = nextOrder
      task.updatedAt = new Date().toISOString()
    },

    reorderTasksInColumn(
      state,
      action: PayloadAction<{
        status: ITask['status']
        fromIndex: number
        toIndex: number
      }>,
    ) {
      const { status, fromIndex, toIndex } = action.payload
      const columnTasks = state.items
        .filter((task) => task.status === status)
        .sort((left, right) => left.order - right.order)

      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= columnTasks.length ||
        toIndex >= columnTasks.length ||
        fromIndex === toIndex
      ) {
        return
      }

      const [movedTask] = columnTasks.splice(fromIndex, 1)

      if (!movedTask) {
        return
      }

      columnTasks.splice(toIndex, 0, movedTask)

      columnTasks.forEach((task, index) => {
        const existingTask = state.items.find((item) => item.id === task.id)

        if (!existingTask) {
          return
        }

        existingTask.order = index
        existingTask.updatedAt = new Date().toISOString()
      })
    },

    moveTaskToColumn(
      state,
      action: PayloadAction<{
        taskId: string
        toStatus: ITask['status']
        toIndex: number
      }>,
    ) {
      const { taskId, toStatus, toIndex } = action.payload
      const taskToMove = state.items.find((task) => task.id === taskId)

      if (!taskToMove) {
        return
      }

      const updatedAt = new Date().toISOString()

      const remainingTasks = state.items.filter((task) => task.id !== taskId)

      const destinationTasks = remainingTasks
        .filter((task) => task.status === toStatus)
        .sort((left, right) => left.order - right.order)

      const nextTask: ITask = {
        ...taskToMove,
        status: toStatus,
        order: 0,
        updatedAt,
      }

      const safeIndex = Math.max(0, Math.min(toIndex, destinationTasks.length))
      destinationTasks.splice(safeIndex, 0, nextTask)

      const normalizedTasks = ['todo', 'in_progress', 'review', 'done'].flatMap(
        (status) => {
          if (status === toStatus) {
            return destinationTasks.map((task, index) => ({
              ...task,
              order: index,
            }))
          }

          return remainingTasks
            .filter((task) => task.status === status)
            .sort((left, right) => left.order - right.order)
            .map((task, index) => ({
              ...task,
              order: index,
            }))
        },
      )

      state.items = normalizedTasks
    },

    setTaskFilters(
      state,
      action: PayloadAction<
        Partial<{
          status: TaskFilterStatus
          priority: TaskFilterPriority
          keyword: string
          labelId: string | 'all'
        }>
      >,
    ) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    resetTaskFilters(state) {
      state.filters = initialState.filters
    },
  },
})
//#endregion slice

//#region exports
export const {
  hydrateTasks,
  addTask,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  bulkUpdateTaskStatus,
  toggleTaskStatus,
  reorderTasksInColumn,
  moveTaskToColumn,
  setTaskFilters,
  resetTaskFilters,
} = taskSlice.actions

export default taskSlice.reducer
//#endregion exports

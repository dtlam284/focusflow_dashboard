import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { ITask, ITasksState, TaskFilterPriority, TaskFilterStatus } from '../../types/taskTypes'

//#region helpers
const getNormalizedLabelIds = (labelIds: string[] | undefined): string[] => {
  if (!labelIds?.length) {
    return []
  }

  return Array.from(new Set(labelIds))
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
      state.items = action.payload.map((task) => ({
        ...task,
        labelIds: getNormalizedLabelIds(task.labelIds),
      }))
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
      const taskToDelete = state.items.find((task) => task.id === action.payload)

      if (!taskToDelete) {
        return
      }

      state.items = state.items
        .filter((task) => task.id !== action.payload)
        .map((task) => {
          if (
            task.status === taskToDelete.status &&
            task.order > taskToDelete.order
          ) {
            return {
              ...task,
              order: task.order - 1,
            }
          }

          return task
        })
    },

    toggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload)

      if (!task) {
        return
      }

      const nextStatus = task.status === 'done' ? 'todo' : 'done'
      const nextOrder = state.items.filter((item) => item.status === nextStatus).length

      task.status = nextStatus
      task.order = nextOrder
      task.updatedAt = new Date().toISOString()
    },

    reorderTasksInColumn(state, action: PayloadAction<{
      status: ITask['status']
      fromIndex: number
      toIndex: number
    }>) {
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

    moveTaskToColumn(state, action: PayloadAction<{
      taskId: string
      toStatus: ITask['status']
      toIndex: number
    }>) {
      const { taskId, toStatus, toIndex } = action.payload
      const taskToMove = state.items.find((task) => task.id === taskId)

      if (!taskToMove || taskToMove.status === toStatus) {
        return
      }

      const sourceStatus = taskToMove.status
      const sourceOrder = taskToMove.order

      const sourceTasks = state.items
        .filter((task) => task.status === sourceStatus && task.id !== taskId)
        .sort((left, right) => left.order - right.order)
        .map((task, index) => ({
          ...task,
          order: index,
        }))

      const targetTasks = state.items
        .filter((task) => task.status === toStatus)
        .sort((left, right) => left.order - right.order)

      const nextTask = {
        ...taskToMove,
        status: toStatus,
        order: Math.max(0, Math.min(toIndex, targetTasks.length)),
        updatedAt: new Date().toISOString(),
      }

      targetTasks.splice(nextTask.order, 0, nextTask)

      targetTasks.forEach((task, index) => {
        task.order = index
      })

      state.items = state.items
        .filter((task) => task.id !== taskId)
        .map((task) => {
          if (task.status === sourceStatus && task.order > sourceOrder) {
            return {
              ...task,
              order: task.order - 1,
            }
          }

          return task
        })

      state.items.push(...sourceTasks, ...targetTasks.filter((task) => task.id === taskId))
      state.items = state.items.map((task) => {
        const targetTask = targetTasks.find((item) => item.id === task.id)

        if (targetTask) {
          return targetTask
        }

        return task
      })
    },

    setTaskFilters(
      state,
      action: PayloadAction<Partial<{
        status: TaskFilterStatus
        priority: TaskFilterPriority
        keyword: string
        labelId: string | 'all'
      }>>,
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
  toggleTaskStatus,
  reorderTasksInColumn,
  moveTaskToColumn,
  setTaskFilters,
  resetTaskFilters,
} = taskSlice.actions

export default taskSlice.reducer
//#endregion exports

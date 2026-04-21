import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type IMoveTaskToColumnPayload,
  type IReorderTasksInColumnPayload,
  type ITask,
  type ITaskFilters,
  type ITasksState,
  type TaskPriority,
  type TaskStatus,
} from '../../types/taskTypes'

//#region state
const initialState: ITasksState = {
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
  },
}
//#endregion state

//#region payload types
type AddTaskPayload = Omit<ITask, 'order'> & {
  order?: number
}

type UpdateTaskPayload = {
  id: string
  changes: Partial<Omit<ITask, 'id' | 'createdAt' | 'order'>>
}
//#endregion payload types

//#region helpers
const LEGACY_STATUS_MAP: Record<string, TaskStatus> = {
  todo: 'todo',
  in_progress: 'in_progress',
  review: 'review',
  done: 'done',
  unfinished: 'todo',
  all: 'todo',
}

const isTaskStatus = (value: unknown): value is TaskStatus => {
  return typeof value === 'string' && TASK_STATUSES.includes(value as TaskStatus)
}

const isTaskPriority = (value: unknown): value is TaskPriority => {
  return typeof value === 'string' && TASK_PRIORITIES.includes(value as TaskPriority)
}

const sortTasksByOrder = (tasks: ITask[]): ITask[] => {
  return [...tasks].sort((a, b) => a.order - b.order)
}

const clampIndex = (value: number, max: number): number => {
  if (max <= 0) return 0
  return Math.max(0, Math.min(value, max))
}

const getNextOrderForStatus = (
  tasks: ITask[],
  status: TaskStatus,
  excludeTaskId?: string,
): number => {
  return tasks.filter((task) => task.status === status && task.id !== excludeTaskId).length
}

const normalizeColumnOrders = (tasks: ITask[], status: TaskStatus): void => {
  const columnTasks = sortTasksByOrder(tasks.filter((task) => task.status === status))

  columnTasks.forEach((task, index) => {
    task.order = index
  })
}

const normalizeHydratedTasks = (tasks: unknown): ITask[] => {
  if (!Array.isArray(tasks)) {
    return []
  }

  const now = new Date().toISOString()

  const normalizedTasks = tasks.reduce<ITask[]>((accumulator, item, index) => {
    if (!item || typeof item !== 'object') {
      return accumulator
    }

    const rawTask = item as Partial<ITask> & {
      status?: string
      priority?: string
      order?: number
    }

    const mappedStatus = LEGACY_STATUS_MAP[rawTask.status ?? ''] ?? 'todo'

    accumulator.push({
      id:
        typeof rawTask.id === 'string' && rawTask.id.trim().length > 0
          ? rawTask.id
          : crypto.randomUUID(),
      title: typeof rawTask.title === 'string' ? rawTask.title : '',
      description: typeof rawTask.description === 'string' ? rawTask.description : undefined,
      status: isTaskStatus(mappedStatus) ? mappedStatus : 'todo',
      order:
        typeof rawTask.order === 'number' && Number.isFinite(rawTask.order) ? rawTask.order : index,
      priority: isTaskPriority(rawTask.priority) ? rawTask.priority : 'medium',
      dueDate: typeof rawTask.dueDate === 'string' ? rawTask.dueDate : undefined,
      dueTime: typeof rawTask.dueTime === 'string' ? rawTask.dueTime : undefined,
      createdAt: typeof rawTask.createdAt === 'string' ? rawTask.createdAt : now,
      updatedAt: typeof rawTask.updatedAt === 'string' ? rawTask.updatedAt : now,
    })

    return accumulator
  }, [])

  TASK_STATUSES.forEach((status) => {
    normalizeColumnOrders(normalizedTasks, status)
  })

  return normalizedTasks
}
//#endregion helpers

//#region slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<AddTaskPayload>) {
      const nextTask: ITask = {
        ...action.payload,
        order:
          typeof action.payload.order === 'number'
            ? action.payload.order
            : getNextOrderForStatus(state.items, action.payload.status),
      }

      state.items.push(nextTask)
      normalizeColumnOrders(state.items, nextTask.status)
    },

    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { id, changes } = action.payload
      const task = state.items.find((item) => item.id === id)

      if (!task) return

      const previousStatus = task.status
      const nextStatus = changes.status ?? task.status

      Object.assign(task, changes, {
        status: nextStatus,
        order:
          nextStatus !== previousStatus
            ? getNextOrderForStatus(state.items, nextStatus, task.id)
            : task.order,
        updatedAt: new Date().toISOString(),
      })

      if (nextStatus !== previousStatus) {
        normalizeColumnOrders(state.items, previousStatus)
        normalizeColumnOrders(state.items, nextStatus)
      }
    },

    deleteTask(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload)
      if (!task) return

      const removedStatus = task.status

      state.items = state.items.filter((item) => item.id !== action.payload)
      normalizeColumnOrders(state.items, removedStatus)
    },

    toggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload)
      if (!task) return

      const previousStatus = task.status
      const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done'

      task.status = nextStatus
      task.order = getNextOrderForStatus(state.items, nextStatus, task.id)
      task.updatedAt = new Date().toISOString()

      normalizeColumnOrders(state.items, previousStatus)
      normalizeColumnOrders(state.items, nextStatus)
    },

    reorderTasksInColumn(state, action: PayloadAction<IReorderTasksInColumnPayload>) {
      const { status, fromIndex, toIndex } = action.payload

      const columnTasks = sortTasksByOrder(state.items.filter((task) => task.status === status))

      if (columnTasks.length <= 1) return

      const safeFromIndex = clampIndex(fromIndex, columnTasks.length - 1)
      const safeToIndex = clampIndex(toIndex, columnTasks.length - 1)

      if (safeFromIndex === safeToIndex) return

      const [movedTask] = columnTasks.splice(safeFromIndex, 1)

      if (!movedTask) return

      columnTasks.splice(safeToIndex, 0, movedTask)

      columnTasks.forEach((task, index) => {
        task.order = index

        if (task.id === movedTask.id) {
          task.updatedAt = new Date().toISOString()
        }
      })
    },

    moveTaskToColumn(state, action: PayloadAction<IMoveTaskToColumnPayload>) {
      const { taskId, toStatus, toIndex } = action.payload

      const task = state.items.find((item) => item.id === taskId)
      if (!task) return

      const fromStatus = task.status

      const sourceTasks = sortTasksByOrder(state.items.filter((item) => item.status === fromStatus))

      const fromIndex = sourceTasks.findIndex((item) => item.id === taskId)
      if (fromIndex === -1) return

      const [movingTask] = sourceTasks.splice(fromIndex, 1)
      if (!movingTask) return

      if (fromStatus === toStatus) {
        const safeToIndex = clampIndex(toIndex, sourceTasks.length)
        sourceTasks.splice(safeToIndex, 0, movingTask)

        sourceTasks.forEach((item, index) => {
          item.order = index

          if (item.id === movingTask.id) {
            item.updatedAt = new Date().toISOString()
          }
        })

        return
      }

      sourceTasks.forEach((item, index) => {
        item.order = index
      })

      movingTask.status = toStatus
      movingTask.updatedAt = new Date().toISOString()

      const targetTasks = sortTasksByOrder(
        state.items.filter((item) => item.status === toStatus && item.id !== movingTask.id),
      )

      const safeToIndex = clampIndex(toIndex, targetTasks.length)
      targetTasks.splice(safeToIndex, 0, movingTask)

      targetTasks.forEach((item, index) => {
        item.order = index
      })
    },

    setTaskFilters(state, action: PayloadAction<Partial<ITaskFilters>>) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
    },

    resetTaskFilters(state) {
      state.filters = initialState.filters
    },

    hydrateTasks(state, action: PayloadAction<unknown>) {
      state.items = normalizeHydratedTasks(action.payload)
    },
  },
})
//#endregion slice

//#region exports
export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  reorderTasksInColumn,
  moveTaskToColumn,
  setTaskFilters,
  resetTaskFilters,
  hydrateTasks,
} = taskSlice.actions

export default taskSlice.reducer
//#endregon exports

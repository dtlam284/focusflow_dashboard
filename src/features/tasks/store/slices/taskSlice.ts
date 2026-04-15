import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type TaskStatus = 'all' | 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'all' | 'low' | 'medium' | 'high'

export interface ITask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface ITaskFilters {
  status: TaskStatus
  priority: TaskPriority
  keyword: string
}

export interface ITasksState {
  items: ITask[]
  filters: ITaskFilters
}

const initialState: ITasksState = {
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
  },
}

type UpdateTaskPayload = {
  id: string
  changes: Partial<Omit<ITask, 'id' | 'createdAt'>>
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<ITask>) {
      state.items.unshift(action.payload)
    },

    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { id, changes } = action.payload
      const task = state.items.find((item) => item.id === id)

      if (!task) return

      Object.assign(task, changes, {
        updatedAt: new Date().toISOString(),
      })
    },

    deleteTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    toggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((item) => item.id === action.payload)

      if (!task) return

      task.status = task.status === 'done' ? 'todo' : 'done'
      task.updatedAt = new Date().toISOString()
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

    hydrateTasks(state, action: PayloadAction<ITask[]>) {
      state.items = action.payload
    },
  },
})

export const {
  addTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  setTaskFilters,
  resetTaskFilters,
  hydrateTasks,
} = taskSlice.actions

export default taskSlice.reducer
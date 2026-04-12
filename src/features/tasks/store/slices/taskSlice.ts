import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface TaskFilters {
  status: 'all' | TaskStatus
  priority: 'all' | TaskPriority
  keyword: string
}

export interface TasksState {
  items: Task[]
  filters: TaskFilters
}

const initialState: TasksState = {
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
  },
}

type UpdateTaskPayload = {
  id: string
  changes: Partial<Omit<Task, 'id' | 'createdAt'>>
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
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
    setTaskFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
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

export const { addTask, updateTask, deleteTask, setTaskFilters, resetTaskFilters } =
  taskSlice.actions

export default taskSlice.reducer
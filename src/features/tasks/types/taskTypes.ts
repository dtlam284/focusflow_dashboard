export const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const
export const TASK_FILTER_STATUSES = [
  'all',
  'todo',
  'in_progress',
  'review',
  'done',
  'unfinished',
] as const

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const
export const TASK_FILTER_PRIORITIES = ['all', 'low', 'medium', 'high'] as const

//#region unions
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskComputedStatus = TaskStatus | 'unfinished'

export type TaskFilterStatus = (typeof TASK_FILTER_STATUSES)[number]
export type TaskPriority = (typeof TASK_PRIORITIES)[number]
export type TaskFilterPriority = (typeof TASK_FILTER_PRIORITIES)[number]
//#endregion unions

//#region task entity
export interface ITask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  order: number
  priority: TaskPriority
  dueDate?: string
  dueTime?: string
  createdAt: string
  updatedAt: string
}
//#endregion task entity

//#region task filters and state
export interface ITaskFilters {
  status: TaskFilterStatus
  priority: TaskFilterPriority
  keyword: string
}

export interface ITasksState {
  items: ITask[]
  filters: ITaskFilters
}
//#endregion task filters and state

//#region form values
export interface ICreateTaskFormValues {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: string
  dueTime?: string
}

export interface IUpdateTaskFormValues {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: string
  dueTime?: string
  status: TaskStatus
}
//#endregion form values

//#region board payloads and models
export interface IReorderTasksInColumnPayload {
  status: TaskStatus
  fromIndex: number
  toIndex: number
}

export interface IMoveTaskToColumnPayload {
  taskId: string
  toStatus: TaskStatus
  toIndex: number
}

export interface ITaskBoardColumn {
  status: TaskStatus
  tasks: ITask[]
}
//#endregion board payloads and models

//#region comments
export interface ITaskComment {
  id: string
  taskId: string
  content: string
  createdAt: string
}

export interface ITaskCommentsState {
  byTaskId: Record<string, ITaskComment[]>
}
//#endregion comments

export type TaskStatus = 'all' | 'todo' | 'unfinished' | 'done';

export type TaskPriority = 'all' | 'low' | 'medium' | 'high';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskFilters {
  status: TaskStatus;
  priority: TaskPriority;
  keyword: string;
}

export interface ITasksState {
  items: ITask[];
  filters: ITaskFilters;
}

export interface ICreateTaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
}

export interface IUpdateTaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  status: TaskStatus;
}

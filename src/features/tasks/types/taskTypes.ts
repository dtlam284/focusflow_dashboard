export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status: "all" | TaskStatus;
  priority: "all" | TaskPriority;
  keyword: string;
}

export interface TasksState {
  items: Task[];
  filters: TaskFilters;
}

export interface CreateTaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskFormValues {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
}
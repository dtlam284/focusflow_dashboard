import { z } from 'zod'
import { TASK_PRIORITIES } from '../types/taskTypes'

//#region schema
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Please enter a task title')
    .max(120, 'Task title must be at most 120 characters'),
  description: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().min(1, 'Please select a due date'),
  dueTime: z.string().optional(),
  labelIds: z.array(z.string()),
})
//#endregion schema

//#region types
export type TaskFormValues = z.infer<typeof taskSchema>
//#endregion types

//#region defaults
export const defaultTaskFormValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
  labelIds: [],
}
//#endregion defaults

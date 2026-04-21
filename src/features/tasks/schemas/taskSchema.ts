import { z } from 'zod'

//#region helpers
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
//#endregion helpers

//#region schema
export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title must not exceed 100 characters.'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters.')
    .optional()
    .or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high'] as const, {
    message: 'Please select a priority.',
  }),
  dueDate: z
    .string()
    .trim()
    .min(1, 'Please select a due date.')
    .refine((value) => value >= getTodayDateString(), 'Due date cannot be earlier than today.'),
  dueTime: z.string().trim().min(1, 'Please select a time.'),
})
//#endregion schema

//#region types
export type TaskFormValues = z.infer<typeof taskFormSchema>
//#endregion types

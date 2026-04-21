import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, Clock3, Plus, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField } from '@/components/shared/FormField'
import { useI18n } from '@/contexts/I18nContext'

import { taskFormSchema, type TaskFormValues } from '../schemas/taskSchema'

//#region props
export interface ITaskFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => void | Promise<void>
  onCancelEdit?: () => void
  isSubmitting?: boolean
  submitLabel?: string
  className?: string
}
//#endregion props

//#region helpers
const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
//#endregion helpers

//#region constants
const EMPTY_VALUES: TaskFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  dueTime: '',
}
//#endregion constants

//#region component
export function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancelEdit,
  isSubmitting = false,
  submitLabel,
  className,
}: ITaskFormProps) {
  //#region hooks
  const { t } = useI18n()
  const minDueDate = React.useMemo(() => {
    if (mode === 'edit' && initialValues?.dueDate) {
      return initialValues.dueDate
    }

    return getTodayDateString()
  }, [mode, initialValues?.dueDate])
  //#endregion hooks

  //#region form setup
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      ...EMPTY_VALUES,
      ...initialValues,
    },
  })
  //#endregion form setup

  //#region effects
  React.useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      ...initialValues,
    })
  }, [initialValues, reset])
  //#endregion effects

  //#region derived values
  const submitting = isSubmitting || isFormSubmitting
  const isEditMode = mode === 'edit'
  //#endregion derived values

  //#region handlers
  const submitHandler = async (values: TaskFormValues) => {
    await onSubmit(values)

    if (!isEditMode) {
      reset(EMPTY_VALUES)
    }
  }
  //#endregion handlers

  //#region render
  return (
    <form onSubmit={handleSubmit(submitHandler)} className={className ?? 'space-y-4'}>
      <FormField
        label={t('Title')}
        htmlFor="task-title"
        required
        hint={t('Use a short, clear task title.')}
      >
        <Input
          id="task-title"
          placeholder={t('Enter task title')}
          aria-invalid={errors.title ? 'true' : 'false'}
          {...register('title')}
        />
        {errors.title ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{errors.title.message}</p>
        ) : null}
      </FormField>

      <FormField
        label={t('Description')}
        htmlFor="task-description"
        hint={t('Add more context for this task.')}
      >
        <Textarea
          id="task-description"
          placeholder={t('Write a short description')}
          className="min-h-24"
          aria-invalid={errors.description ? 'true' : 'false'}
          {...register('description')}
        />
        {errors.description ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{errors.description.message}</p>
        ) : null}
      </FormField>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField label={t('Priority')} required hint={t('Set the task priority.')}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={errors.priority ? 'true' : 'false'}>
                  <SelectValue placeholder={t('Select priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('Low')}</SelectItem>
                  <SelectItem value="medium">{t('Medium')}</SelectItem>
                  <SelectItem value="high">{t('High')}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.priority.message}</p>
          ) : null}
        </FormField>

        <FormField
          label={t('Due date')}
          htmlFor="task-due-date"
          required
          hint={t('Set a target date.')}
        >
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="task-due-date"
              type="date"
              min={minDueDate}
              className="pl-9"
              aria-invalid={errors.dueDate ? 'true' : 'false'}
              {...register('dueDate')}
            />
          </div>
          {errors.dueDate ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.dueDate.message}</p>
          ) : null}
        </FormField>

        <FormField
          label={t('Time')}
          htmlFor="task-due-time"
          required
          hint={t('Set a target time.')}
        >
          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="task-due-time"
              type="time"
              className="pl-9"
              aria-invalid={errors.dueTime ? 'true' : 'false'}
              {...register('dueTime')}
            />
          </div>
          {errors.dueTime ? (
            <p className="text-sm text-rose-600 dark:text-rose-400">{errors.dueTime.message}</p>
          ) : null}
        </FormField>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Button type="submit" isLoading={submitting}>
          {isEditMode ? (
            <>
              <Save className="h-4 w-4" />
              {submitLabel ?? t('Save changes')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              {submitLabel ?? t('Add task')}
            </>
          )}
        </Button>

        {onCancelEdit ? (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
            {t('Cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
  //#endregion render
}
//#endregion component

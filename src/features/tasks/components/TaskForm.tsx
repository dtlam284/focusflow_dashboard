import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/contexts/I18nContext'

import {
  defaultTaskFormValues,
  taskSchema,
  type TaskFormValues,
} from '../schemas/taskSchema'
import { TaskLabelField } from './TaskLabelField'

//#region props
interface ITaskFormProps {
  mode: 'create' | 'edit'
  initialValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => void | Promise<void>
  onCancelEdit?: () => void
}
//#endregion props

//#region component
export function TaskForm({
  mode,
  initialValues,
  onSubmit,
  onCancelEdit,
}: ITaskFormProps) {
  const { t } = useI18n()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      ...defaultTaskFormValues,
      ...initialValues,
      labelIds: initialValues?.labelIds ?? defaultTaskFormValues.labelIds,
    },
  })

  useEffect(() => {
    reset({
      ...defaultTaskFormValues,
      ...initialValues,
      labelIds: initialValues?.labelIds ?? defaultTaskFormValues.labelIds,
    })
  }, [initialValues, reset])

  const priority = useWatch({
    control,
    name: 'priority',
  })

  const labelIds =
    useWatch({
      control,
      name: 'labelIds',
    }) ?? []

  const submitLabel = mode === 'edit' ? t('Save changes') : t('Add task')

  return (
    <form className='space-y-5' onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-2'>
        <Label htmlFor='task-title'>
          {t('Title')}
          <span className='text-rose-500'>*</span>
        </Label>
        <Input
          id='task-title'
          placeholder={t('Enter task title')}
          {...register('title')}
        />
        <p className='text-xs text-slate-500 dark:text-slate-400'>
          {t('Use a short, clear task title.')}
        </p>
        {errors.title ? (
          <p className='text-xs text-rose-500'>{t(errors.title.message ?? '')}</p>
        ) : null}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='task-description'>{t('Description')}</Label>
        <Textarea
          id='task-description'
          placeholder={t('Write a short description')}
          className='min-h-28'
          {...register('description')}
        />
        <p className='text-xs text-slate-500 dark:text-slate-400'>
          {t('Add more context for this task.')}
        </p>
      </div>

      <TaskLabelField
        value={labelIds}
        onChange={(nextValue: string[]) => {
          setValue('labelIds', nextValue, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
      />

      <div className='grid gap-4 md:grid-cols-3'>
        <div className='space-y-2'>
          <Label htmlFor='task-priority'>
            {t('Priority')}
            <span className='text-rose-500'>*</span>
          </Label>
          <Select
            value={priority}
            onValueChange={(value) =>
              setValue('priority', value as TaskFormValues['priority'], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id='task-priority'>
              <SelectValue placeholder={t('Select priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>{t('Low')}</SelectItem>
              <SelectItem value='medium'>{t('Medium')}</SelectItem>
              <SelectItem value='high'>{t('High')}</SelectItem>
            </SelectContent>
          </Select>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('Set the task priority.')}
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='task-due-date'>
            {t('Due date')}
            <span className='text-rose-500'>*</span>
          </Label>
          <Input id='task-due-date' type='date' {...register('dueDate')} />
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('Set a target date.')}
          </p>
          {errors.dueDate ? (
            <p className='text-xs text-rose-500'>{t(errors.dueDate.message ?? '')}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='task-due-time'>{t('Time')}</Label>
          <Input id='task-due-time' type='time' {...register('dueTime')} />
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {t('Set a target time.')}
          </p>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <Button type='submit' disabled={isSubmitting}>
          {submitLabel}
        </Button>

        {mode === 'edit' && onCancelEdit ? (
          <Button type='button' variant='outline' onClick={onCancelEdit}>
            {t('Cancel')}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
//#endregion component

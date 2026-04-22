import * as React from 'react'
import {
  CalendarDays,
  Check,
  Clock3,
  FileText,
  PencilLine,
  Tag,
  X,
} from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { addTaskActivity } from '../store/slices/taskActivitySlice'
import { closeTaskDetail } from '../store/slices/taskDetailSlice'
import { updateTask } from '../store/slices/taskSlice'
import {
  selectIsTaskDetailOpen,
  selectSelectedTaskDetail,
  selectSelectedTaskId,
} from '../store/selectors/taskDetailSelectors'
import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors'
import type { TaskComputedStatus } from '../types/taskTypes'
import { TaskActivityTimeline } from './TaskActivityTimeline'
import { TaskCommentsSection } from './TaskCommentsSection'
import { TaskLabelChips } from './TaskLabelChips'

//#region constants
const statusLabels: Record<TaskComputedStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
  unfinished: 'Unfinished',
}

const statusStyles: Record<TaskComputedStatus, string> = {
  todo: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  in_progress:
    'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  review:
    'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  done: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  unfinished:
    'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}

const priorityLabels = {
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
} as const

const priorityStyles = {
  low: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  medium:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  high: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
} as const
//#endregion constants

//#region helpers
const formatDateTime = (value?: string) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
//#endregion helpers

//#region component
export function TaskDetailPanel() {
  //#region hooks
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  const isOpen = useAppSelector(selectIsTaskDetailOpen)
  const selectedTaskId = useAppSelector(selectSelectedTaskId)
  const selectedTask = useAppSelector(selectSelectedTaskDetail)
  //#endregion hooks

  //#region local state
  const [draftTitle, setDraftTitle] = React.useState('')
  const [draftDescription, setDraftDescription] = React.useState('')
  const titleInputRef = React.useRef<HTMLInputElement | null>(null)
  //#endregion local state

  //#region effects
  React.useEffect(() => {
    if (selectedTask) {
      setDraftTitle(selectedTask.title)
      setDraftDescription(selectedTask.description ?? '')
    } else if (!isOpen) {
      setDraftTitle('')
      setDraftDescription('')
    }
  }, [selectedTask, isOpen])

  React.useEffect(() => {
    if (isOpen && selectedTaskId && !selectedTask) {
      dispatch(closeTaskDetail())
    }
  }, [dispatch, isOpen, selectedTaskId, selectedTask])

  React.useEffect(() => {
    if (!isOpen) return

    const timer = window.setTimeout(() => {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }, 50)

    return () => window.clearTimeout(timer)
  }, [isOpen, selectedTaskId])
  //#endregion effects

  //#region derived values
  const effectiveStatus = selectedTask ? getTaskEffectiveStatus(selectedTask) : null

  const isDirty =
    selectedTask != null &&
    (draftTitle !== selectedTask.title ||
      draftDescription !== (selectedTask.description ?? ''))
  //#endregion derived values

  //#region handlers
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      dispatch(closeTaskDetail())
    }
  }

  const handleSave = () => {
    if (!selectedTask) return

    const nextTitle = draftTitle.trim()
    const nextDescription = draftDescription.trim()
    const hasTitleChanged = nextTitle !== selectedTask.title

    if (!nextTitle) return

    dispatch(
      updateTask({
        id: selectedTask.id,
        changes: {
          title: nextTitle,
          description: nextDescription || undefined,
        },
      }),
    )

    if (hasTitleChanged) {
      dispatch(
        addTaskActivity({
          id: crypto.randomUUID(),
          taskId: selectedTask.id,
          type: 'updated',
          createdAt: new Date().toISOString(),
        }),
      )
    }

    setDraftTitle(nextTitle)
    setDraftDescription(nextDescription)
  }

  const handleReset = () => {
    if (!selectedTask) return

    setDraftTitle(selectedTask.title)
    setDraftDescription(selectedTask.description ?? '')
  }
  //#endregion handlers

  //#region render
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side='right'
        className='w-full overflow-y-auto p-0 sm:right-3 sm:top-3 sm:bottom-3 sm:h-auto sm:max-w-xl sm:rounded-2xl sm:border'
      >
        {selectedTask ? (
          <div className='flex h-full flex-col'>
            <SheetHeader className='border-b border-slate-200 px-6 py-5 dark:border-slate-800'>
              <SheetTitle>{t('Task details')}</SheetTitle>
              <SheetDescription>
                {t('Task information.')}
              </SheetDescription>
            </SheetHeader>

            <div className='flex-1 space-y-6 px-6 py-6'>
              <section className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    {t('Title')}
                  </label>
                  <Input
                    ref={titleInputRef}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder={t('Enter task title')}
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                    {t('Description')}
                  </label>
                  <Textarea
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    placeholder={t('Write a short description')}
                    className='min-h-32'
                  />
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    type='button'
                    onClick={handleSave}
                    disabled={!isDirty || draftTitle.trim().length === 0}
                  >
                    <Check className='h-4 w-4' />
                    {t('Save')}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleReset}
                    disabled={!isDirty}
                  >
                    <X className='h-4 w-4' />
                    {t('Cancel changes')}
                  </Button>
                </div>
              </section>

              <section className='space-y-4'>
                <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  {t('Metadata')}
                </h3>

                <div className='grid gap-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {effectiveStatus ? (
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                          statusStyles[effectiveStatus],
                        )}
                      >
                        {t(statusLabels[effectiveStatus])}
                      </span>
                    ) : null}

                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                        priorityStyles[selectedTask.priority],
                      )}
                    >
                      <Tag className='mr-1 h-3.5 w-3.5' />
                      {t(priorityLabels[selectedTask.priority])}
                    </span>
                  </div>

                  <TaskLabelChips labelIds={selectedTask.labelIds} />

                  <div className='grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40'>
                    <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                      <CalendarDays className='mt-0.5 h-4 w-4 shrink-0' />
                      <div>
                        <p className='font-medium'>{t('Due date')}</p>
                        <p className='text-slate-500 dark:text-slate-400'>
                          {selectedTask.dueDate
                            ? `${selectedTask.dueDate}${selectedTask.dueTime ? ` ${selectedTask.dueTime}` : ''}`
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                      <Clock3 className='mt-0.5 h-4 w-4 shrink-0' />
                      <div>
                        <p className='font-medium'>{t('Created at')}</p>
                        <p className='text-slate-500 dark:text-slate-400'>
                          {formatDateTime(selectedTask.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                      <PencilLine className='mt-0.5 h-4 w-4 shrink-0' />
                      <div>
                        <p className='font-medium'>{t('Updated at')}</p>
                        <p className='text-slate-500 dark:text-slate-400'>
                          {formatDateTime(selectedTask.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'>
                      <FileText className='mt-0.5 h-4 w-4 shrink-0' />
                      <div>
                        <p className='font-medium'>{t('Task ID')}</p>
                        <p className='break-all text-slate-500 dark:text-slate-400'>
                          {selectedTask.id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <TaskActivityTimeline taskId={selectedTask.id} />

              <TaskCommentsSection taskId={selectedTask.id} />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
  //#endregion render
}
//#endregion component

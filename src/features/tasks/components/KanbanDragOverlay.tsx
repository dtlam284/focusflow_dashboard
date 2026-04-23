import { CalendarDays, GripVertical } from 'lucide-react'

import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors'
import type { ITask, TaskComputedStatus } from '../types/taskTypes'

//#region props
export interface IKanbanDragOverlayProps {
  task: ITask
}
//#endregion props

//#region constants
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

const statusLabels: Record<TaskComputedStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
  unfinished: 'Unfinished',
}

const priorityStyles: Record<ITask['priority'], string> = {
  low: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  medium:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  high: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}

const priorityLabels: Record<ITask['priority'], string> = {
  low: 'Low priority',
  medium: 'Medium priority',
  high: 'High priority',
}
//#endregion constants

//#region component
export function KanbanDragOverlay({ task }: IKanbanDragOverlayProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region derived values
  const effectiveStatus = getTaskEffectiveStatus(task)
  const isDone = task.status === 'done'
  //#endregion derived values

  //#region render
  return (
    <article className='w-[280px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-blue-500/20 dark:border-slate-800 dark:bg-slate-950'>
      <div className='space-y-3'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 space-y-1'>
            <h3
              className={cn(
                'line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100',
                isDone && 'text-slate-500 line-through dark:text-slate-500',
              )}
            >
              {task.title}
            </h3>

            {task.description ? (
              <p
                className={cn(
                  'line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400',
                  isDone && 'text-slate-400 dark:text-slate-500',
                )}
              >
                {task.description}
              </p>
            ) : null}
          </div>

          <div className='flex items-center gap-2'>
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                statusStyles[effectiveStatus],
              )}
            >
              {t(statusLabels[effectiveStatus])}
            </span>

            <span className='inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400'>
              <GripVertical className='h-4 w-4' />
            </span>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
              priorityStyles[task.priority],
            )}
          >
            {t(priorityLabels[task.priority])}
          </span>

          {task.dueDate ? (
            <span className='inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400'>
              <CalendarDays className='h-3.5 w-3.5' />
              {t('Due')}: {task.dueDate}
              {task.dueTime ? ` ${task.dueTime}` : ''}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
  //#endregion render
}
//#endregion component

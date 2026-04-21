import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pencil, Trash2 } from 'lucide-react'

import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors'
import type { ITask, TaskComputedStatus } from '../types/taskTypes'

//#region types
interface IKanbanTaskCardProps {
  task: ITask
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onEdit: (task: ITask) => void
  onDelete: (taskId: string) => void
}
//#endregion types

//#region constants
const taskStatusUi: Record<TaskComputedStatus, { label: string; classes: string }> = {
  todo: {
    label: 'To do',
    classes:
      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  },
  in_progress: {
    label: 'In progress',
    classes:
      'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  },
  review: {
    label: 'Review',
    classes:
      'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  },
  done: {
    label: 'Done',
    classes:
      'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  unfinished: {
    label: 'Unfinished',
    classes:
      'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  },
}

const priorityStyles: Record<ITask['priority'], string> = {
  low: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  medium:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  high: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
}
//#endregion constants

//#region component
export function KanbanTaskCard({
  task,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
}: IKanbanTaskCardProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region derived values
  const effectiveStatus = getTaskEffectiveStatus(task)
  const isDone = task.status === 'done'
  const canMoveUp = index > 0
  const canMoveDown = index < total - 1
  const canMoveLeft = task.status !== 'todo'
  const canMoveRight = task.status !== 'done'
  //#endregion derived values

  //#region render
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
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

          <span
            className={cn(
              'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium',
              taskStatusUi[effectiveStatus].classes,
            )}
          >
            {t(taskStatusUi[effectiveStatus].label)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
              priorityStyles[task.priority],
            )}
          >
            {task.priority === 'high'
              ? t('High priority')
              : task.priority === 'medium'
                ? t('Medium priority')
                : t('Low priority')}
          </span>

          {task.dueDate ? (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('Due')}: {task.dueDate}
              {task.dueTime ? ` ${task.dueTime}` : ''}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {t('Up')}
          </button>

          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {t('Down')}
          </button>

          <button
            type="button"
            disabled={!canMoveLeft}
            onClick={onMoveLeft}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('Left')}
          </button>

          <button
            type="button"
            disabled={!canMoveRight}
            onClick={onMoveRight}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {t('Right')}
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('Edit')}
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-rose-200 px-2 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-900 dark:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('Delete')}
          </button>
        </div>
      </div>
    </article>
  )
  //#endregion render
}
//#endregion component

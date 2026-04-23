import { CalendarDays, Pencil, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'
import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors'
import { InlineTaskTitle } from './InlineTaskTitle'
import { TaskLabelChips } from './TaskLabelChips'
import type { IBoardLabelGroupColumn } from '../store/selectors/boardSelectors'
import type { ITask, TaskComputedStatus } from '../types/taskTypes'

//#region props
interface ILabelBoardProps {
  columns: IBoardLabelGroupColumn[]
  selectedTaskIds: string[]
  onToggleTaskSelection: (taskId: string) => void
  onOpenTask: (task: ITask) => void
  onEditTask: (task: ITask) => void
  onDeleteTask: (taskId: string) => void
}
//#endregion props

//#region constants
const labelColorClasses: Record<string, string> = {
  rose: 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  blue: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  violet:
    'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  amber:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  slate:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
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
export function LabelBoard({
  columns,
  selectedTaskIds,
  onToggleTaskSelection,
  onOpenTask,
  onEditTask,
  onDeleteTask,
}: ILabelBoardProps) {
  const { t } = useI18n()

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300'>
        {t(
          'Grouped by primary label. Switch back to status grouping to drag and drop tasks.',
        )}
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        {columns.map((column) => (
          <section
            key={column.id}
            className='rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50'
          >
            <header className='mb-4 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
                    labelColorClasses[column.color] ?? labelColorClasses.slate,
                  )}
                >
                  <Tag className='mr-1 h-3.5 w-3.5' />
                  {t(column.title)}
                </span>
              </div>

              <p className='text-xs text-slate-500 dark:text-slate-400'>
                {column.tasks.length}{' '}
                {column.tasks.length === 1 ? t('task') : t('tasks')}
              </p>
            </header>

            <div className='space-y-3'>
              {column.tasks.length === 0 ? (
                <div className='rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400'>
                  {t('No tasks in this group')}
                </div>
              ) : null}

              {column.tasks.map((task) => {
                const effectiveStatus = getTaskEffectiveStatus(task)
                const isDone = task.status === 'done'
                const isSelected = selectedTaskIds.includes(task.id)

                return (
                  <article
                    key={`${column.id}-${task.id}`}
                    onClick={() => onOpenTask(task)}
                    className={cn(
                      'cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-950',
                      isSelected
                        ? 'border-blue-400 ring-2 ring-blue-200 dark:border-blue-500 dark:ring-blue-900/40'
                        : 'border-slate-200 dark:border-slate-800',
                    )}
                  >
                    <div className='space-y-3'>
                      <div className='flex items-start gap-3'>
                        <div className='pt-0.5'>
                          <input
                            type='checkbox'
                            checked={isSelected}
                            onChange={() => onToggleTaskSelection(task.id)}
                            onClick={(event) => event.stopPropagation()}
                            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
                            aria-label={`Select task ${task.title}`}
                          />
                        </div>

                        <div className='min-w-0 flex-1 space-y-3'>
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0 space-y-1'>
                              <InlineTaskTitle
                                taskId={task.id}
                                title={task.title}
                                className={cn(
                                  'line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100',
                                  isDone &&
                                    'text-slate-500 line-through dark:text-slate-500',
                                )}
                              />

                              {task.description ? (
                                <p
                                  className={cn(
                                    'line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400',
                                    isDone &&
                                      'text-slate-400 dark:text-slate-500',
                                  )}
                                >
                                  {task.description}
                                </p>
                              ) : null}
                            </div>

                            <span
                              className={cn(
                                'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                                statusStyles[effectiveStatus],
                              )}
                            >
                              {t(statusLabels[effectiveStatus])}
                            </span>
                          </div>

                          <TaskLabelChips labelIds={task.labelIds} maxVisible={3} />

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

                          <div className='flex items-center gap-2 pt-1'>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              className='flex-1'
                              onClick={(event) => {
                                event.stopPropagation()
                                onEditTask(task)
                              }}
                            >
                              <Pencil className='h-4 w-4' />
                              {t('Edit')}
                            </Button>

                            <Button
                              type='button'
                              size='sm'
                              variant='destructive'
                              className='flex-1'
                              onClick={(event) => {
                                event.stopPropagation()
                                onDeleteTask(task.id)
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                              {t('Delete')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
//#endregion component

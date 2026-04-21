import { useI18n } from '@/contexts/I18nContext'

import type { ITask, ITaskBoardColumn } from '../types/taskTypes'
import { KanbanTaskCard } from './KanbanTaskCard'

//#region types
interface IKanbanColumnProps {
  column: ITaskBoardColumn
  onMoveTaskUp: (task: ITask, index: number) => void
  onMoveTaskDown: (task: ITask, index: number) => void
  onMoveTaskLeft: (task: ITask, index: number) => void
  onMoveTaskRight: (task: ITask, index: number) => void
  onEditTask: (task: ITask) => void
  onDeleteTask: (taskId: string) => void
}
//#endregion types

//#region constants
const columnTitles: Record<ITaskBoardColumn['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  review: 'Review',
  done: 'Done',
}
//#endregion constants

//#region component
export function KanbanColumn({
  column,
  onMoveTaskUp,
  onMoveTaskDown,
  onMoveTaskLeft,
  onMoveTaskRight,
  onEditTask,
  onDeleteTask,
}: IKanbanColumnProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region render
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100">
            {t(columnTitles[column.status])}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {column.tasks.length} {column.tasks.length === 1 ? t('task') : t('tasks')}
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {column.tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            {t('No tasks in this column yet.')}
          </div>
        ) : (
          column.tasks.map((task, index) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              index={index}
              total={column.tasks.length}
              onMoveUp={() => onMoveTaskUp(task, index)}
              onMoveDown={() => onMoveTaskDown(task, index)}
              onMoveLeft={() => onMoveTaskLeft(task, index)}
              onMoveRight={() => onMoveTaskRight(task, index)}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </section>
  )
  //#endregion render
}
//#endregion component

import * as React from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'

import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import type { ITask, ITaskBoardColumn, TaskStatus } from '../types/taskTypes'
import { KanbanDropIndicator } from './KanbanDropIndicator'
import { KanbanTaskCard } from './KanbanTaskCard'

//#region props
export interface IKanbanColumnDragPreview {
  status: TaskStatus
  index: number
}

export interface IKanbanColumnProps {
  column: ITaskBoardColumn
  dragPreview: IKanbanColumnDragPreview | null
  isDraggingTask: boolean
  onOpenTask: (task: ITask) => void
  onEditTask: (task: ITask) => void
  onDeleteTask: (taskId: string) => void
  selectedTaskIds: string[]
  onToggleTaskSelection: (taskId: string) => void
}
//#endregion props

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
  dragPreview,
  isDraggingTask,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  selectedTaskIds,
  onToggleTaskSelection,
}: IKanbanColumnProps) {
  //#region hooks
  const { t } = useI18n()

  const { setNodeRef, isOver } = useDroppable({
    id: `column:${column.status}`,
    data: {
      type: 'column',
      status: column.status,
    },
  })
  //#endregion hooks

  //#region derived values
  const taskIds = React.useMemo(
    () => column.tasks.map((task) => task.id),
    [column.tasks],
  )

  const isEmpty = column.tasks.length === 0
  const previewIndex =
    dragPreview?.status === column.status ? dragPreview.index : null
  //#endregion derived values

  //#region render
  return (
    <section className='rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50'>
      <header className='mb-4 flex items-center justify-between gap-3'>
        <div>
          <h2 className='text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-slate-100'>
            {t(columnTitles[column.status])}
          </h2>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            {column.tasks.length} {column.tasks.length === 1 ? t('task') : t('tasks')}
          </p>
        </div>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-[240px] space-y-3 rounded-xl border border-transparent p-1 transition-colors',
            isOver && 'border-blue-400/50 bg-blue-500/5',
          )}
        >
          {isEmpty ? (
            <KanbanDropIndicator
              size='block'
              isActive={Boolean(isDraggingTask && previewIndex === 0)}
              label={t('Drop a task here')}
            />
          ) : (
            <>
              {column.tasks.map((task, index) => (
                <React.Fragment key={`${task.id}-${task.updatedAt}`}>
                  {isDraggingTask && previewIndex === index ? (
                    <KanbanDropIndicator isActive />
                  ) : null}

                  <KanbanTaskCard
                    task={task}
                    index={index}
                    columnStatus={column.status}
                    onOpen={onOpenTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    isSelected={selectedTaskIds.includes(task.id)}
                    onToggleTaskSelection={onToggleTaskSelection}
                  />
                </React.Fragment>
              ))}

              {isDraggingTask && previewIndex === column.tasks.length ? (
                <KanbanDropIndicator
                  isActive={isOver}
                  label={t('Drop here to place at the end')}
                  size='block'
                  className='min-h-[72px]'
                />
              ) : null}
            </>
          )}
        </div>
      </SortableContext>
    </section>
  )
  //#endregion render
}
//#endregion component

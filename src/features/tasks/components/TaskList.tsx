import * as React from 'react'

import { cn } from '@/utils'
import { useI18n } from '@/contexts/I18nContext'
import { EmptyState } from '@/components/shared/EmptyState'

import { TaskCard } from './TaskCard'
import type { ITask, ITaskFilters } from '../types/taskTypes'

//#region props
export interface ITaskListProps {
  tasks: ITask[]
  filters?: ITaskFilters
  onEdit: (task: ITask) => void
  onDelete: (taskId: string) => void
  onToggleStatus: (taskId: string) => void
  emptyAction?: React.ReactNode
  className?: string
}
//#endregion props

//#region component
export function TaskList({
  tasks,
  filters,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyAction,
  className,
}: ITaskListProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region derived values
  const hasActiveFilters = Boolean(
    filters &&
    (filters.status !== 'all' || filters.priority !== 'all' || filters.keyword.trim().length > 0),
  )
  //#endregion derived values

  //#region guards
  if (tasks.length === 0) {
    return (
      <EmptyState
        className={cn('min-h-[260px]', className)}
        title={hasActiveFilters ? t('No matching tasks') : t('No tasks yet')}
        description={
          hasActiveFilters
            ? t('Try changing the current filters or search keyword.')
            : t('Create your first task to start organizing your work.')
        }
        action={emptyAction}
      />
    )
  }
  //#endregion guards

  //#region render
  return (
    <div className={cn('space-y-4', className)}>
      {tasks.map((task) => (
        <TaskCard
          key={`${task.id}-${task.updatedAt}`}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  )
  //#endregion render
}
//#endregion component

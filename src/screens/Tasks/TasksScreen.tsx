import * as React from 'react'
import { AlertTriangle, CheckCircle2, Clock3, ListTodo, Plus } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'

import { KanbanBoard } from '@/features/tasks/components/KanbanBoard'
import { TaskFilterBar } from '@/features/tasks/components/TaskFilterBar'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import {
  addTask,
  deleteTask,
  resetTaskFilters,
  setTaskFilters,
  updateTask,
} from '@/features/tasks/store/slices/taskSlice'
import {
  selectCompletedTaskCount,
  selectFilteredTasks,
  selectPendingTaskCount,
  selectTaskFilters,
  selectTaskItems,
  selectUnfinishedTaskCount,
} from '@/features/tasks/store/selectors/taskSelectors'
import type { ITask, ITaskFilters } from '@/features/tasks/types/taskTypes'

import { TaskEditorDialog } from '@/features/tasks/components/TaskEditorDialog'

//#region component
export function TasksScreen() {
  //#region hooks
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region selectors
  const tasks = useAppSelector(selectTaskItems)
  const filters = useAppSelector(selectTaskFilters)
  const filteredTasks = useAppSelector(selectFilteredTasks)
  const completedCount = useAppSelector(selectCompletedTaskCount)
  const pendingCount = useAppSelector(selectPendingTaskCount)
  const unfinishedCount = useAppSelector(selectUnfinishedTaskCount)
  //#endregion selectors

  //#region local state
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [taskPendingDelete, setTaskPendingDelete] = React.useState<ITask | null>(null)
  //#endregion local state

  //#region derived values
  const editingTask = tasks.find((task) => task.id === editingTaskId) ?? null
  const isEditDialogOpen = Boolean(editingTask)
  const totalCount = tasks.length

  const initialFormValues = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        dueDate: editingTask.dueDate ?? '',
        dueTime: editingTask.dueTime ?? '',
      }
    : undefined
  //#endregion derived values

  //#region handlers
  const handleCreateTask = async (values: TaskFormValues) => {
    const now = new Date().toISOString()

    dispatch(
      addTask({
        id: crypto.randomUUID(),
        title: values.title,
        description: values.description?.trim() || undefined,
        priority: values.priority,
        dueDate: values.dueDate.trim(),
        dueTime: values.dueTime?.trim() || undefined,
        status: 'todo',
        createdAt: now,
        updatedAt: now,
      }),
    )
  }

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!editingTask) return

    dispatch(
      updateTask({
        id: editingTask.id,
        changes: {
          title: values.title,
          description: values.description?.trim() || undefined,
          priority: values.priority,
          dueDate: values.dueDate.trim(),
          dueTime: values.dueTime?.trim() || undefined,
        },
      }),
    )

    setEditingTaskId(null)
  }

  const handleStartEdit = (task: ITask) => {
    setEditingTaskId(task.id)
  }

  const handleRequestDelete = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null
    setTaskPendingDelete(task)
  }

  const handleConfirmDelete = () => {
    if (!taskPendingDelete) return

    dispatch(deleteTask(taskPendingDelete.id))

    if (editingTaskId === taskPendingDelete.id) {
      setEditingTaskId(null)
    }

    setTaskPendingDelete(null)
  }

  const handleStatusChange = (status: ITaskFilters['status']) => {
    dispatch(setTaskFilters({ status }))
  }

  const handlePriorityChange = (priority: ITaskFilters['priority']) => {
    dispatch(setTaskFilters({ priority }))
  }

  const handleKeywordChange = (keyword: string) => {
    dispatch(setTaskFilters({ keyword }))
  }

  const handleResetFilters = () => {
    dispatch(resetTaskFilters())
  }
  //#endregion handlers

  //#region render
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Tasks')}
        description={t('Manage your tasks with a clean and focused workflow.')}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('Add task')}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t('Total tasks')}
          value={totalCount}
          icon={<ListTodo className="h-4 w-4" />}
        />
        <StatCard title={t('Pending')} value={pendingCount} icon={<Clock3 className="h-4 w-4" />} />
        <StatCard
          title={t('Completed')}
          value={completedCount}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatCard
          title={t('Unfinished')}
          value={unfinishedCount}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="space-y-4">
        <TaskFilterBar
          filters={filters}
          visibleCount={filteredTasks.length}
          onKeywordChange={handleKeywordChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onReset={handleResetFilters}
        />

        <KanbanBoard
          tasks={filteredTasks}
          onEditTask={handleStartEdit}
          onDeleteTask={handleRequestDelete}
        />
      </div>

      <TaskEditorDialog
        open={isCreateDialogOpen}
        mode="create"
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTask}
      />

      <TaskEditorDialog
        open={isEditDialogOpen}
        mode="edit"
        initialValues={initialFormValues}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTaskId(null)
          }
        }}
        onSubmit={handleUpdateTask}
      />

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        title={t('Delete task')}
        description={
          taskPendingDelete
            ? t('Are you sure you want to delete "{title}"?', {
                title: taskPendingDelete.title,
              })
            : t('Are you sure you want to delete this task?')
        }
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        onOpenChange={(open) => {
          if (!open) {
            setTaskPendingDelete(null)
          }
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
  //#endregion render
}
//#endregion component

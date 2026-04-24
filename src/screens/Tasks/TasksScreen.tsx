import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { LabelBoard } from '@/features/tasks/components/LabelBoard'
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard'
import { BulkActionBar } from '@/features/tasks/components/BulkActionBar'
import { TaskFilterBar } from '@/features/tasks/components/TaskFilterBar'
import { TaskDetailPanel } from '@/features/tasks/components/TaskDetailPanel'
import { openTaskDetail } from '@/features/tasks/store/slices/taskDetailSlice'
import { TaskEditorDialog } from '@/features/tasks/components/TaskEditorDialog'
import { BoardPreferencesBar } from '@/features/tasks/components/BoardPreferencesBar'
import { removeCommentsByTaskId } from '@/features/tasks/store/slices/taskCommentsSlice'
import { addTaskActivity, removeActivitiesByTaskId} from '@/features/tasks/store/slices/taskActivitySlice'
import {  resetBoardPreferences,  setGroupMode,  setShowCompleted,  setSortMode } from '@/features/tasks/store/slices/boardSlice'
import { addTask, bulkDeleteTasks, bulkUpdateTaskStatus, deleteTask, resetTaskFilters, setTaskFilters, updateTask } from '@/features/tasks/store/slices/taskSlice'
import { selectBoardVisibleTasks, selectGroupMode, selectShowCompleted, selectSortMode, selectLabelGroupedColumns } from '@/features/tasks/store/selectors/boardSelectors'
import { selectTaskFilters, selectTaskItems } from '@/features/tasks/store/selectors/taskSelectors'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import type { ITask, ITaskFilters, TaskStatus } from '@/features/tasks/types/taskTypes'
import type { BoardGroupMode, BoardSortMode,} from '@/features/tasks/store/slices/boardSlice'

//#region component
export function TasksScreen() {
  //#region hooks
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region selectors
  const tasks = useAppSelector(selectTaskItems)
  const filters = useAppSelector(selectTaskFilters)
  const boardVisibleTasks = useAppSelector(selectBoardVisibleTasks)
  const showCompleted = useAppSelector(selectShowCompleted)
  const sortMode = useAppSelector(selectSortMode)
  const groupMode = useAppSelector(selectGroupMode)
  const labelGroupedColumns = useAppSelector(selectLabelGroupedColumns)
  //#endregion selectors

  //#region local state
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [taskPendingDelete, setTaskPendingDelete] = React.useState<ITask | null>(
    null,
  )
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([])
  const [taskIdsPendingBulkDelete, setTaskIdsPendingBulkDelete] = React.useState<
    string[]
  >([])
  //#endregion local state

  //#region derived values
  const editingTask = tasks.find((task: ITask) => task.id === editingTaskId) ?? null
  const isEditDialogOpen = Boolean(editingTask)

  const initialFormValues = editingTask
    ? {
        title: editingTask.title,
        description: editingTask.description ?? '',
        priority: editingTask.priority,
        dueDate: editingTask.dueDate ?? '',
        dueTime: editingTask.dueTime ?? '',
        labelIds: editingTask.labelIds,
      }
    : undefined
  //#endregion derived values

  //#region handlers
  const handleCreateTask = async (values: TaskFormValues) => {
    const now = new Date().toISOString()
    const taskId = crypto.randomUUID()

    dispatch(
      addTask({
        id: taskId,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        priority: values.priority,
        dueDate: values.dueDate.trim(),
        dueTime: values.dueTime?.trim() || undefined,
        labelIds: values.labelIds,
        status: 'todo',
        order: 0,
        createdAt: now,
        updatedAt: now,
      }),
    )

    dispatch(
      addTaskActivity({
        id: crypto.randomUUID(),
        taskId,
        type: 'created',
        createdAt: now,
      }),
    )
  }

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!editingTask) return

    const nextTitle = values.title.trim()
    const nextDescription = values.description?.trim() || undefined
    const hasTitleChanged = nextTitle !== editingTask.title

    dispatch(
      updateTask({
        id: editingTask.id,
        changes: {
          title: nextTitle,
          description: nextDescription,
          priority: values.priority,
          dueDate: values.dueDate.trim(),
          dueTime: values.dueTime?.trim() || undefined,
          labelIds: values.labelIds,
        },
      }),
    )

    if (hasTitleChanged) {
      dispatch(
        addTaskActivity({
          id: crypto.randomUUID(),
          taskId: editingTask.id,
          type: 'updated',
          createdAt: new Date().toISOString(),
        }),
      )
    }

    setEditingTaskId(null)
  }

  const handleStartEdit = (task: ITask) => {
    setEditingTaskId(task.id)
  }

  const handleRequestDelete = (taskId: string) => {
    const task = tasks.find((item: ITask) => item.id === taskId) ?? null
    setTaskPendingDelete(task)
  }

  const handleConfirmDelete = () => {
    if (!taskPendingDelete) return

    dispatch(deleteTask(taskPendingDelete.id))
    dispatch(removeCommentsByTaskId(taskPendingDelete.id))
    dispatch(removeActivitiesByTaskId(taskPendingDelete.id))

    setSelectedTaskIds((prev) =>
      prev.filter((taskId) => taskId !== taskPendingDelete.id),
    )

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

  const handleLabelChange = (labelId: ITaskFilters['labelId']) => {
    dispatch(setTaskFilters({ labelId }))
  }

  const handleResetFilters = () => {
    dispatch(resetTaskFilters())
  }

  const handleToggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((selectedId) => selectedId !== taskId)
        : [...prev, taskId],
    )
  }

  const handleClearSelection = () => {
    setSelectedTaskIds([])
  }

  const handleRequestBulkDelete = () => {
    if (selectedTaskIds.length === 0) {
      return
    }

    setTaskIdsPendingBulkDelete(selectedTaskIds)
  }

  const handleConfirmBulkDelete = () => {
    if (taskIdsPendingBulkDelete.length === 0) {
      return
    }

    dispatch(bulkDeleteTasks(taskIdsPendingBulkDelete))

    taskIdsPendingBulkDelete.forEach((taskId) => {
      dispatch(removeCommentsByTaskId(taskId))
      dispatch(removeActivitiesByTaskId(taskId))
    })

    if (editingTaskId && taskIdsPendingBulkDelete.includes(editingTaskId)) {
      setEditingTaskId(null)
    }

    setSelectedTaskIds([])
    setTaskIdsPendingBulkDelete([])
  }

  const handleBulkStatusChange = (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) {
      return
    }

    dispatch(
      bulkUpdateTaskStatus({
        taskIds: selectedTaskIds,
        status,
      }),
    )

    setSelectedTaskIds([])
  }

  const handleShowCompletedChange = (value: boolean) => {
    dispatch(setShowCompleted(value))
  }

  const handleSortModeChange = (value: BoardSortMode) => {
    dispatch(setSortMode(value))
  }

  const handleGroupModeChange = (value: BoardGroupMode) => {
    dispatch(setGroupMode(value))
  }

  const handleResetBoardPreferences = () => {
    dispatch(resetBoardPreferences())
  }

  const handleOpenTaskDetail = (task: ITask) => {
    dispatch(openTaskDetail(task.id))
  }
  //#endregion handlers

  //#region render
  return (
    <div className='space-y-6'>
      <PageHeader
        title={t('Tasks')}
        // description={t('Manage your tasks with a clean and focused workflow.')}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className='h-4 w-4' />
            {t('Add task')}
          </Button>
        }
      />
      
      <div className='space-y-4'>
        <div className='grid gap-4 xl:grid-cols-[1.45fr_1fr] xl:items-start'>
          <TaskFilterBar
            filters={filters}
            visibleCount={boardVisibleTasks.length}
            onKeywordChange={handleKeywordChange}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onLabelChange={handleLabelChange}
            onReset={handleResetFilters}
          />

          <BoardPreferencesBar
            showCompleted={showCompleted}
            sortMode={sortMode}
            groupMode={groupMode}
            onShowCompletedChange={handleShowCompletedChange}
            onSortModeChange={handleSortModeChange}
            onGroupModeChange={handleGroupModeChange}
            onReset={handleResetBoardPreferences}
          />
        </div>

        <BulkActionBar
          selectedCount={selectedTaskIds.length}
          onClearSelection={handleClearSelection}
          onDeleteSelected={handleRequestBulkDelete}
          onChangeStatus={handleBulkStatusChange}
        />

        {groupMode === 'status' ? (
          <KanbanBoard
            tasks={boardVisibleTasks}
            onEditTask={handleStartEdit}
            onDeleteTask={handleRequestDelete}
            selectedTaskIds={selectedTaskIds}
            onToggleTaskSelection={handleToggleTaskSelection}
          />
        ) : (
          <LabelBoard
            columns={labelGroupedColumns}
            selectedTaskIds={selectedTaskIds}
            onToggleTaskSelection={handleToggleTaskSelection}
            onOpenTask={handleOpenTaskDetail}
            onEditTask={handleStartEdit}
            onDeleteTask={handleRequestDelete}
          />
        )}
      </div>

      <TaskEditorDialog
        open={isCreateDialogOpen}
        mode='create'
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTask}
      />

      <TaskEditorDialog
        open={isEditDialogOpen}
        mode='edit'
        initialValues={initialFormValues}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setEditingTaskId(null)
          }
        }}
        onSubmit={handleUpdateTask}
      />

      <TaskDetailPanel />

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
        onOpenChange={(open: boolean) => {
          if (!open) {
            setTaskPendingDelete(null)
          }
        }}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={taskIdsPendingBulkDelete.length > 0}
        title={t('Delete selected tasks')}
        description={t('Are you sure you want to delete {count} selected tasks?', {
          count: String(taskIdsPendingBulkDelete.length),
        })}
        confirmLabel={t('Delete selected')}
        cancelLabel={t('Cancel')}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setTaskIdsPendingBulkDelete([])
          }
        }}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  )
  //#endregion render
}
//#endregion component

import * as React from 'react'

import { useAppDispatch } from '@/app/store/hooks'

import { moveTaskToColumn, reorderTasksInColumn } from '../store/slices/taskSlice'
import {
  TASK_STATUSES,
  type ITask,
  type ITaskBoardColumn,
  type TaskStatus,
} from '../types/taskTypes'
import { KanbanColumn } from './KanbanColumn'

//#region types
interface IKanbanBoardProps {
  tasks: ITask[]
  onEditTask: (task: ITask) => void
  onDeleteTask: (taskId: string) => void
}
//#endregion types

//#region helpers
const nextStatusMap: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: 'in_progress',
  in_progress: 'review',
  review: 'done',
}

const previousStatusMap: Partial<Record<TaskStatus, TaskStatus>> = {
  in_progress: 'todo',
  review: 'in_progress',
  done: 'review',
}
//#endregion helpers

//#region component
export function KanbanBoard({ tasks, onEditTask, onDeleteTask }: IKanbanBoardProps) {
  //#region hooks
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region derived values
  const columns = React.useMemo<ITaskBoardColumn[]>(() => {
    return TASK_STATUSES.map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order),
    }))
  }, [tasks])
  //#endregion derived values

  //#region handlers
  const handleMoveTaskUp = (task: ITask, index: number) => {
    if (index <= 0) return

    dispatch(
      reorderTasksInColumn({
        status: task.status,
        fromIndex: index,
        toIndex: index - 1,
      }),
    )
  }

  const handleMoveTaskDown = (task: ITask, index: number) => {
    const column = columns.find((item) => item.status === task.status)
    if (!column || index >= column.tasks.length - 1) return

    dispatch(
      reorderTasksInColumn({
        status: task.status,
        fromIndex: index,
        toIndex: index + 1,
      }),
    )
  }

  const handleMoveTaskLeft = (task: ITask) => {
    const previousStatus = previousStatusMap[task.status]
    if (!previousStatus) return

    dispatch(
      moveTaskToColumn({
        taskId: task.id,
        toStatus: previousStatus,
        toIndex: 0,
      }),
    )
  }

  const handleMoveTaskRight = (task: ITask, index: number) => {
    const nextStatus = nextStatusMap[task.status]
    if (!nextStatus) return

    const currentColumn = columns.find((item) => item.status === task.status)
    const targetColumn = columns.find((item) => item.status === nextStatus)

    const targetIndex =
      currentColumn && index >= currentColumn.tasks.length - 1
        ? (targetColumn?.tasks.length ?? 0)
        : 0

    dispatch(
      moveTaskToColumn({
        taskId: task.id,
        toStatus: nextStatus,
        toIndex: targetIndex,
      }),
    )
  }
  //#endregion handlers

  //#region render
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          column={column}
          onMoveTaskUp={handleMoveTaskUp}
          onMoveTaskDown={handleMoveTaskDown}
          onMoveTaskLeft={handleMoveTaskLeft}
          onMoveTaskRight={handleMoveTaskRight}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  )
  //#endregion render
}
//#endregion component

import * as React from 'react'
import { MessageSquare, Plus } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/contexts/I18nContext'

import { addTaskActivity } from '../store/slices/taskActivitySlice'
import {
  selectCommentCountByTaskId,
  selectRootCommentsByTaskId,
} from '../store/selectors/taskCommentSelectors'
import { addTaskComment } from '../store/slices/taskCommentsSlice'
import { TaskCommentItem } from './TaskCommentItem'

//#region props
interface ITaskCommentsSectionProps {
  taskId: string
}
//#endregion props

//#region component
export function TaskCommentsSection({ taskId }: ITaskCommentsSectionProps) {
  //#region hooks
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  const rootComments = useAppSelector((state) =>
    selectRootCommentsByTaskId(state, taskId),
  )
  const totalCommentCount = useAppSelector((state) =>
    selectCommentCountByTaskId(state, taskId),
  )
  //#endregion hooks

  //#region local state
  const [content, setContent] = React.useState('')
  //#endregion local state

  //#region handlers
  const handleAddComment = () => {
    const nextContent = content.trim()

    if (!nextContent) {
      return
    }

    dispatch(
      addTaskComment({
        id: crypto.randomUUID(),
        taskId,
        content: nextContent,
        createdAt: new Date().toISOString(),
      }),
    )

    dispatch(
      addTaskActivity({
        id: crypto.randomUUID(),
        taskId,
        type: 'commented',
        createdAt: new Date().toISOString(),
      }),
    )

    setContent('')
  }
  //#endregion handlers

  //#region render
  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <MessageSquare className='h-4 w-4 text-slate-500 dark:text-slate-400' />
        <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
          {t('Comments')}
        </h3>
      </div>

      <div className='space-y-3'>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t('Write a comment')}
          className='min-h-24'
        />

        <Button
          type='button'
          onClick={handleAddComment}
          disabled={content.trim().length === 0}
        >
          <Plus className='h-4 w-4' />
          {t('Add comment')}
        </Button>
      </div>

      {totalCommentCount === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400'>
          {t('No comments yet for this task.')}
        </div>
      ) : (
        <div className='space-y-4'>
          {rootComments.map((comment) => (
            <TaskCommentItem
              key={comment.id}
              taskId={taskId}
              comment={comment}
            />
          ))}
        </div>
      )}
    </section>
  )
  //#endregion render
}
//#endregion component

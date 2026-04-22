import * as React from 'react'
import { CornerDownRight, MessageSquare, Plus } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { selectRepliesByParentId } from '../store/selectors/taskCommentSelectors'
import { addTaskComment } from '../store/slices/taskCommentsSlice'
import type { ITaskComment } from '../types/taskTypes'

//#region props
interface ITaskCommentItemProps {
  taskId: string
  comment: ITaskComment
  isReply?: boolean
}
//#endregion props

//#region helpers
const formatDateTime = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
//#endregion helpers

//#region component
export function TaskCommentItem({
  taskId,
  comment,
  isReply = false,
}: ITaskCommentItemProps) {
  //#region hooks
  const dispatch = useAppDispatch()
  const { t } = useI18n()

  const replies = useAppSelector((state) =>
    selectRepliesByParentId(state, taskId, comment.id),
  )
  //#endregion hooks

  //#region local state
  const [isReplying, setIsReplying] = React.useState(false)
  const [replyContent, setReplyContent] = React.useState('')
  //#endregion local state

  //#region handlers
  const handleAddReply = () => {
    const nextContent = replyContent.trim()

    if (!nextContent) {
      return
    }

    dispatch(
      addTaskComment({
        id: crypto.randomUUID(),
        taskId,
        parentId: comment.id,
        content: nextContent,
        createdAt: new Date().toISOString(),
      }),
    )

    setReplyContent('')
    setIsReplying(false)
  }
  //#endregion handlers

  //#region render
  return (
    <div
      className={cn(
        'space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40',
        isReply && 'ml-5 border-l-4 border-l-slate-300 dark:border-l-slate-700',
      )}
    >
      <div className='space-y-2'>
        <p className='whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200'>
          {comment.content}
        </p>

        <p className='text-xs text-slate-500 dark:text-slate-400'>
          {formatDateTime(comment.createdAt)}
        </p>
      </div>

      {!isReply ? (
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setIsReplying((prev) => !prev)}
          >
            <CornerDownRight className='h-4 w-4' />
            {t('Reply')}
          </Button>
        </div>
      ) : null}

      {!isReply && isReplying ? (
        <div className='space-y-3 rounded-xl border border-dashed border-slate-200 p-3 dark:border-slate-800'>
          <Textarea
            value={replyContent}
            onChange={(event) => setReplyContent(event.target.value)}
            placeholder={t('Write a reply')}
            className='min-h-20'
          />

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              size='sm'
              onClick={handleAddReply}
              disabled={replyContent.trim().length === 0}
            >
              <Plus className='h-4 w-4' />
              {t('Add reply')}
            </Button>

            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setIsReplying(false)
                setReplyContent('')
              }}
            >
              {t('Cancel')}
            </Button>
          </div>
        </div>
      ) : null}

      {!isReply && replies.length > 0 ? (
        <div className='space-y-3'>
          <div className='flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400'>
            <MessageSquare className='h-3.5 w-3.5' />
            {replies.length} {replies.length === 1 ? t('reply') : t('replies')}
          </div>

          {replies.map((reply) => (
            <TaskCommentItem
              key={reply.id}
              taskId={taskId}
              comment={reply}
              isReply
            />
          ))}
        </div>
      ) : null}
    </div>
  )
  //#endregion render
}
//#endregion component

import * as React from 'react'

import { useAppDispatch } from '@/app/store/hooks'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { addTaskActivity } from '../store/slices/taskActivitySlice'
import { updateTask } from '../store/slices/taskSlice'

//#region props
interface IInlineTaskTitleProps {
  taskId: string
  title: string
  className?: string
}
//#endregion props

//#region component
export function InlineTaskTitle({
  taskId,
  title,
  className,
}: IInlineTaskTitleProps) {
  //#region hooks
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  //#endregion hooks

  //#region local state
  const [isEditing, setIsEditing] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState(title)

  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const shouldSkipBlurSaveRef = React.useRef(false)
  //#endregion local state

  //#region effects
  React.useEffect(() => {
    if (!isEditing) {
      setDraftTitle(title)
    }
  }, [title, isEditing])

  React.useEffect(() => {
    if (!isEditing) {
      return
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isEditing])
  //#endregion effects

  //#region handlers
  const beginEditing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()

    setDraftTitle(title)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraftTitle(title)
    setIsEditing(false)
  }

  const saveEditing = () => {
    const nextTitle = draftTitle.trim()

    if (nextTitle.length === 0) {
      cancelEditing()
      return
    }

    if (nextTitle !== title) {
      dispatch(
        updateTask({
          id: taskId,
          changes: {
            title: nextTitle,
          },
        }),
      )

      dispatch(
        addTaskActivity({
          id: crypto.randomUUID(),
          taskId,
          type: 'updated',
          createdAt: new Date().toISOString(),
        }),
      )
    }

    setIsEditing(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      saveEditing()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      shouldSkipBlurSaveRef.current = true
      cancelEditing()
    }
  }

  const handleBlur = () => {
    if (shouldSkipBlurSaveRef.current) {
      shouldSkipBlurSaveRef.current = false
      return
    }

    saveEditing()
  }
  //#endregion handlers

  //#region render
  if (isEditing) {
    return (
      <div
        className='min-w-0'
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <Input
          ref={inputRef}
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          aria-label={t('Edit task title')}
          className='h-8 text-sm font-semibold'
        />
      </div>
    )
  }

  return (
    <button
      type='button'
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={beginEditing}
      className={cn(
        'block w-full cursor-text text-left outline-none',
        className,
      )}
      aria-label={t('Double click to edit task title')}
    >
      {title}
    </button>
  )
  //#endregion render
}
//#endregion component

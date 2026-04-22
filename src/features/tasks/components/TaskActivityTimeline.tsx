import { CheckCircle2, MessageSquare, MoveRight, PencilLine, Sparkles } from 'lucide-react'

import { useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/contexts/I18nContext'

import { selectActivitiesByTaskId } from '../store/selectors/taskActivitySelectors'
import type { ITaskActivity, TaskActivityType } from '../types/taskTypes'

//#region props
interface ITaskActivityTimelineProps {
  taskId: string
}
//#endregion props

//#region constants
const activityLabels: Record<TaskActivityType, string> = {
  created: 'Task created',
  moved: 'Task moved',
  updated: 'Task title updated',
  commented: 'Comment added',
}

const activityIcons: Record<TaskActivityType, typeof Sparkles> = {
  created: Sparkles,
  moved: MoveRight,
  updated: PencilLine,
  commented: MessageSquare,
}
//#endregion constants

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
export function TaskActivityTimeline({ taskId }: ITaskActivityTimelineProps) {
  //#region hooks
  const { t } = useI18n()
  const activities = useAppSelector((state) => selectActivitiesByTaskId(state, taskId))
  //#endregion hooks

  //#region render
  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <CheckCircle2 className='h-4 w-4 text-slate-500 dark:text-slate-400' />
        <h3 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
          {t('Activity')}
        </h3>
      </div>

      {activities.length === 0 ? (
        <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400'>
          {t('No activity yet for this task.')}
        </div>
      ) : (
        <div className='space-y-3'>
          {activities.map((activity: ITaskActivity) => {
            const ActivityIcon = activityIcons[activity.type]

            return (
              <article
                key={activity.id}
                className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40'
              >
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'>
                    <ActivityIcon className='h-4 w-4' />
                  </div>

                  <div className='min-w-0 space-y-1'>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                      {t(activityLabels[activity.type])}
                    </p>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
  //#endregion render
}
//#endregion component

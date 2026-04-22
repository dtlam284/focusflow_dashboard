import { useAppSelector } from '@/app/store/hooks'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { selectLabelsByIds } from '../store/selectors/labelSelectors'

//#region constants
const labelColorClasses: Record<string, string> = {
  rose: 'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
  blue: 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
  violet:
    'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
  amber:
    'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  slate:
    'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
}
//#endregion constants

//#region props
interface ITaskLabelChipsProps {
  labelIds: string[]
  maxVisible?: number
  className?: string
}
//#endregion props

//#region component
export function TaskLabelChips({
  labelIds,
  maxVisible,
  className,
}: ITaskLabelChipsProps) {
  const { t } = useI18n()
  const labels = useAppSelector((state) => selectLabelsByIds(state, labelIds))

  if (!labels.length) {
    return null
  }

  const visibleLabels =
    typeof maxVisible === 'number' ? labels.slice(0, maxVisible) : labels

  const hiddenCount =
    typeof maxVisible === 'number' && labels.length > maxVisible
      ? labels.length - maxVisible
      : 0

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleLabels.map((label) => (
        <span
          key={label.id}
          className={cn(
            'inline-flex rounded-full border px-2.5 py-1 text-xs font-medium',
            labelColorClasses[label.color] ?? labelColorClasses.slate,
          )}
        >
          {t(label.name)}
        </span>
      ))}

      {hiddenCount > 0 ? (
        <span className='inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  )
}
//#endregion component

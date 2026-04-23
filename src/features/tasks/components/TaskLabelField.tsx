import { useMemo } from 'react'
import { Check, Tag } from 'lucide-react'

import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'
import { useAppSelector } from '@/app/store/hooks'
import { selectLabelItems } from '../store/selectors/labelSelectors'

import type { ILabel } from '../types/taskTypes'

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
interface ITaskLabelFieldProps {
  value: string[]
  onChange: (nextValue: string[]) => void
}
//#endregion props

//#region component
export function TaskLabelField({ value, onChange }: ITaskLabelFieldProps) {
  const { t } = useI18n()
  const labels = useAppSelector(selectLabelItems)

  const selectedLabelIds = useMemo(() => new Set(value), [value])

  const handleToggleLabel = (labelId: string) => {
    if (selectedLabelIds.has(labelId)) {
      onChange(value.filter((id) => id !== labelId))
      return
    }

    onChange([...value, labelId])
  }

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Tag className='h-4 w-4 text-slate-500 dark:text-slate-400' />
        <h3 className='text-sm font-medium text-slate-900 dark:text-slate-100'>
          {t('Labels')}
        </h3>
      </div>

      <div className='flex flex-wrap gap-2'>
        {labels.map((label: ILabel) => {
          const isSelected = selectedLabelIds.has(label.id)

          return (
            <Button
              key={label.id}
              type='button'
              variant='outline'
              size='sm'
              onClick={() => handleToggleLabel(label.id)}
              className={cn(
                'rounded-full border px-3',
                labelColorClasses[label.color] ?? labelColorClasses.slate,
                isSelected && 'ring-2 ring-slate-300 dark:ring-slate-700',
              )}
            >
              <span className='flex items-center gap-1.5'>
                {isSelected ? <Check className='h-3.5 w-3.5' /> : null}
                {label.name}
              </span>
            </Button>
          )
        })}
      </div>

      <p className='text-xs text-slate-500 dark:text-slate-400'>
        {t('Choose one or more labels for this task.')}
      </p>
    </div>
  )
}
//#endregion component

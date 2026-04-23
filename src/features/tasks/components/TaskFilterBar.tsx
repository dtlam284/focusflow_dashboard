import { RotateCcw, Search, Tag } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'
import { useAppSelector } from '@/app/store/hooks'
import { selectLabelItems } from '../store/selectors/labelSelectors'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { ITaskFilters } from '../types/taskTypes'

//#region props
interface ITaskFilterBarProps {
  filters: ITaskFilters
  visibleCount: number
  onKeywordChange: (keyword: string) => void
  onStatusChange: (status: ITaskFilters['status']) => void
  onPriorityChange: (priority: ITaskFilters['priority']) => void
  onLabelChange: (labelId: ITaskFilters['labelId']) => void
  onReset: () => void
}
//#endregion props

//#region component
export function TaskFilterBar({
  filters,
  visibleCount,
  onKeywordChange,
  onStatusChange,
  onPriorityChange,
  onLabelChange,
  onReset,
}: ITaskFilterBarProps) {
  const { t } = useI18n()
  const labels = useAppSelector(selectLabelItems)

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
            {t('Task filters')}
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('Showing {count} tasks', { count: String(visibleCount) })}
          </p>
        </div>

        <Button type='button' variant='outline' onClick={onReset}>
          <RotateCcw className='h-4 w-4' />
          {t('Reset filters')}
        </Button>
      </div>

      <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
        <div className='relative'>
          <label htmlFor='task-search' className='sr-only'>
            {t('Search tasks')}
          </label>
          <Search className='pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            id='task-search'
            value={filters.keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={t('Search tasks...')}
            className='pl-9'
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onStatusChange(value as ITaskFilters['status'])}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('All statuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('All statuses')}</SelectItem>
            <SelectItem value='todo'>{t('To do')}</SelectItem>
            <SelectItem value='in_progress'>{t('In progress')}</SelectItem>
            <SelectItem value='review'>{t('Review')}</SelectItem>
            <SelectItem value='done'>{t('Done')}</SelectItem>
            <SelectItem value='unfinished'>{t('Unfinished')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) =>
            onPriorityChange(value as ITaskFilters['priority'])
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t('All priorities')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('All priorities')}</SelectItem>
            <SelectItem value='low'>{t('Low priority')}</SelectItem>
            <SelectItem value='medium'>{t('Medium priority')}</SelectItem>
            <SelectItem value='high'>{t('High priority')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.labelId}
          onValueChange={(value) => onLabelChange(value as ITaskFilters['labelId'])}
        >
          <SelectTrigger className='flex items-center gap-2'>
            <Tag className='h-4 w-4 text-slate-400' />
            <SelectValue placeholder={t('All labels')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('All labels')}</SelectItem>
            {labels.map((label) => (
              <SelectItem key={label.id} value={label.id}>
                {t(label.name)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </section>
  )
}
//#endregion component

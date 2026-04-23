import { LayoutGrid, ListFilter, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/contexts/I18nContext'

import type { BoardGroupMode, BoardSortMode } from '../store/slices/boardSlice'

//#region props
interface IBoardPreferencesBarProps {
  showCompleted: boolean
  sortMode: BoardSortMode
  groupMode: BoardGroupMode
  onShowCompletedChange: (value: boolean) => void
  onSortModeChange: (value: BoardSortMode) => void
  onGroupModeChange: (value: BoardGroupMode) => void
  onReset: () => void
}
//#endregion props

//#region component
export function BoardPreferencesBar({
  showCompleted,
  sortMode,
  groupMode,
  onShowCompletedChange,
  onSortModeChange,
  onGroupModeChange,
  onReset,
}: IBoardPreferencesBarProps) {
  const { t } = useI18n()

  //#region render
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100'>
            <SlidersHorizontal className='h-4 w-4' />
            {t('Board preferences')}
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('')}
          </p>
        </div>

        <Button type='button' variant='outline' onClick={onReset}>
          {t('Reset preferences')}
        </Button>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        <label className='flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              {t('Show completed')}
            </p>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              {t('Completed tasks.')}
            </p>
          </div>

          <input
            type='checkbox'
            checked={showCompleted}
            onChange={(event) => onShowCompletedChange(event.target.checked)}
            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
            aria-label={t('Show completed')}
          />
        </label>

        <div className='rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
          <div className='mb-2 flex items-center gap-2'>
            <ListFilter className='h-4 w-4 text-slate-500 dark:text-slate-400' />
            <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              {t('Sort mode')}
            </p>
          </div>

          <Select
            value={sortMode}
            onValueChange={(value) => onSortModeChange(value as BoardSortMode)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('Select sort mode')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>{t('Newest')}</SelectItem>
              <SelectItem value='oldest'>{t('Oldest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
          <div className='mb-2 flex items-center gap-2'>
            <LayoutGrid className='h-4 w-4 text-slate-500 dark:text-slate-400' />
            <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
              {t('Group mode')}
            </p>
          </div>

          <Select
            value={groupMode}
            onValueChange={(value) => onGroupModeChange(value as BoardGroupMode)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('Select group mode')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='status'>{t('Status')}</SelectItem>
              <SelectItem value='label'>{t('Label')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
  //#endregion render
}
//#endregion component

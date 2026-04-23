import { CheckSquare, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/contexts/I18nContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { TaskStatus } from '../types/taskTypes'

//#region props
interface IBulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onDeleteSelected: () => void
  onChangeStatus: (status: TaskStatus) => void
}
//#endregion props

//#region component
export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onChangeStatus,
}: IBulkActionBarProps) {
  const { t } = useI18n()

  if (selectedCount === 0) {
    return null
  }

  return (
    <section className='flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/30 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100'>
        <CheckSquare className='h-4 w-4' />
        <span>
            {selectedCount} {selectedCount === 1 ? 'task selected' : 'tasks selected'}
        </span>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <Select onValueChange={(value) => onChangeStatus(value as TaskStatus)}>
          <SelectTrigger className='min-w-[180px] bg-white dark:bg-slate-950'>
            <SelectValue placeholder={t('Change status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='todo'>{t('To do')}</SelectItem>
            <SelectItem value='in_progress'>{t('In progress')}</SelectItem>
            <SelectItem value='review'>{t('Review')}</SelectItem>
            <SelectItem value='done'>{t('Done')}</SelectItem>
          </SelectContent>
        </Select>

        <Button type='button' variant='outline' onClick={onClearSelection}>
          <X className='h-4 w-4' />
          {t('Clear selection')}
        </Button>

        <Button type='button' variant='destructive' onClick={onDeleteSelected}>
          <Trash2 className='h-4 w-4' />
          {t('Delete selected')}
        </Button>
      </div>
    </section>
  )
}
//#endregion component

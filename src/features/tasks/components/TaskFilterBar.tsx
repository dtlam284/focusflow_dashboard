import * as React from 'react'
import { Search, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/contexts/I18nContext'

import type { ITaskFilters } from '../types/taskTypes'

//#region props
export interface ITaskFilterBarProps {
  filters: ITaskFilters
  visibleCount?: number
  onStatusChange: (status: ITaskFilters['status']) => void
  onPriorityChange: (priority: ITaskFilters['priority']) => void
  onKeywordChange: (keyword: string) => void
  onReset: () => void
}
//#endregion props

//#region component
export function TaskFilterBar({
  filters,
  visibleCount,
  onStatusChange,
  onPriorityChange,
  onKeywordChange,
  onReset,
}: ITaskFilterBarProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region derived values
  const hasActiveFilters =
    filters.status !== 'all' || filters.priority !== 'all' || filters.keyword.trim().length > 0
  //#endregion derived values

  //#region render
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t('Task filters')}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {typeof visibleCount === 'number'
              ? t('Showing {count} tasks', { count: visibleCount })
              : t('Refine the task list by status, priority, or keyword.')}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={onReset} disabled={!hasActiveFilters}>
          <RotateCcw className="h-4 w-4" />
          {t('Reset filters')}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder={t('Search tasks...')}
            aria-label={t('Search tasks')}
            data-skip-auto-label="true"
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status}
          onValueChange={(value) => onStatusChange(value as ITaskFilters['status'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="unfinished">Unfinished</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => onPriorityChange(value as ITaskFilters['priority'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
  //#endregion render
}
//#endregion component

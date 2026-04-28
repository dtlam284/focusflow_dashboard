import * as React from 'react'
import { ExternalLink, Link2, Tag } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useI18n } from '@/contexts/I18nContext'

import { openTaskDetail } from '@/features/tasks/store/slices/taskDetailSlice'
import { selectRelatedTasksByLinkId, selectSuggestedTasksByLinkId } from '@/features/tasks/store/selectors/taskRelationsSelectors'
import { closeLinkDetail } from '@/features/links/store/slices/linkDetailSlice'
import { selectIsLinkDetailOpen, selectSelectedLinkDetail, selectSelectedLinkId } from '@/features/links/store/selectors/linkDetailSelectors'
import { selectSmartLinkingShowReasons } from '@/features/tasks/store/selectors/smartLinkingPreferencesSelectors'

//#region helpers
const formatTaskMeta = (status: string, priority: string) =>
    `${status.replace('_', ' ')} • ${priority}`
//#endregion helpers

//#region component
export function LinkDetailPanel() {
    //#region hooks
    const dispatch = useAppDispatch()
    const { t } = useI18n()

    const isOpen = useAppSelector(selectIsLinkDetailOpen)
    const selectedLinkId = useAppSelector(selectSelectedLinkId)
    const selectedLink = useAppSelector(selectSelectedLinkDetail)

    const relatedTasks = useAppSelector((state) =>
        selectedLinkId ? selectRelatedTasksByLinkId(state, selectedLinkId) : [],
    )

    const suggestedTasks = useAppSelector((state) =>
        selectedLinkId ? selectSuggestedTasksByLinkId(state, selectedLinkId) : [],
    )

    const showSmartLinkingReasons = useAppSelector(selectSmartLinkingShowReasons)
    //#endregion hooks

    //#region effects
    React.useEffect(() => {
        if (isOpen && selectedLinkId && !selectedLink) {
            dispatch(closeLinkDetail())
        }
    }, [dispatch, isOpen, selectedLinkId, selectedLink])
    //#endregion effects

    //#region handlers
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            dispatch(closeLinkDetail())
        }
    }

    const handleOpenTask = (taskId: string) => {
        dispatch(openTaskDetail(taskId))
    }

    const handleOpenLink = () => {
        if (!selectedLink || typeof window === 'undefined') {
            return
        }

        window.open(selectedLink.url, '_blank', 'noopener,noreferrer')
    }
    //#endregion handlers

    //#region render
    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent
                side='right'
                className='w-full overflow-y-auto p-0 sm:right-3 sm:top-3 sm:bottom-3 sm:h-auto sm:max-w-xl sm:rounded-2xl sm:border'
            >
                {selectedLink ? (
                    <div className='flex h-full flex-col'>
                        <SheetHeader className='border-b border-slate-200 px-6 py-5 dark:border-slate-800'>
                            <SheetTitle className='text-left text-xl font-semibold text-slate-900 dark:text-slate-100'>
                                {t('Link details')}
                            </SheetTitle>
                            <SheetDescription>
                                {t('')}
                            </SheetDescription>
                        </SheetHeader>

                        <div className='space-y-6 px-6 py-6'>
                            <section className='space-y-4'>
                                <div className='space-y-2'>
                                    <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                                        {selectedLink.title}
                                    </h3>

                                    <div className='flex flex-wrap items-center gap-2'>
                                        <span className='inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                                            {t('Link')}
                                        </span>

                                        {selectedLink.category !== 'other' ? (
                                            <span className='inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                                                <Tag className='mr-1 h-3.5 w-3.5' />
                                                {selectedLink.category}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40'>
                                    <div className='mb-3 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200'>
                                        <Link2 className='h-4 w-4' />
                                        {t('URL')}
                                    </div>

                                    <p className='break-all text-sm text-slate-700 dark:text-slate-300'>
                                        {selectedLink.url}
                                    </p>

                                    <div className='mt-4'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={handleOpenLink}
                                        >
                                            <ExternalLink className='h-4 w-4' />
                                            {t('Open link')}
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            <section className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                        {t('Related Tasks')}
                                    </h4>
                                    <span className='text-xs text-slate-500 dark:text-slate-400'>
                                        {relatedTasks.length}
                                    </span>
                                </div>

                                {relatedTasks.length === 0 ? (
                                    <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/30'>
                                        <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                                            {t('No related tasks')}
                                        </p>
                                        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                                            {t('')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className='space-y-3'>
                                        {relatedTasks.map((task) => (
                                            <article
                                                key={task.id}
                                                className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40'
                                            >
                                                <div className='flex items-start justify-between gap-3'>
                                                    <div className='min-w-0 flex-1 space-y-1'>
                                                        <h5 className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                                            {task.title}
                                                        </h5>
                                                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                                                            {formatTaskMeta(task.status, task.priority)}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() => handleOpenTask(task.id)}
                                                    >
                                                        {t('Open task')}
                                                    </Button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                        {t('Suggested Tasks')}
                                    </h4>
                                    <span className='text-xs text-slate-500 dark:text-slate-400'>
                                        {suggestedTasks.length}
                                    </span>
                                </div>

                                {suggestedTasks.length === 0 ? (
                                    <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/30'>
                                        <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                                            {t('No suggested tasks')}
                                        </p>
                                        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                                            {t('')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className='space-y-3'>
                                        {suggestedTasks.map((suggestion) => (
                                            <article
                                                key={suggestion.entity.id}
                                                className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40'
                                            >
                                                <div className='flex items-start justify-between gap-3'>
                                                    <div className='min-w-0 flex-1 space-y-1'>
                                                        <h5 className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                                            {suggestion.entity.title}
                                                        </h5>
                                                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                                                            {formatTaskMeta(
                                                                suggestion.entity.status,
                                                                suggestion.entity.priority,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className='flex items-center gap-2'>
                                                        <span className='inline-flex rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'>
                                                            {suggestion.score >= 12
                                                                ? t('Strong match')
                                                                : suggestion.score >= 8
                                                                  ? t('Good match')
                                                                  : t('Possible match')}
                                                        </span>

                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            size='sm'
                                                            onClick={() => handleOpenTask(suggestion.entity.id)}
                                                        >
                                                            {t('Open task')}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {showSmartLinkingReasons && suggestion.reasons.length > 0 ? (
                                                    <div className='mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40'>
                                                        <p className='mb-2 text-xs font-medium text-slate-700 dark:text-slate-200'>
                                                            {t('Why suggested')}
                                                        </p>
                                                        <ul className='space-y-1'>
                                                            {suggestion.reasons.map((reason) => (
                                                                <li
                                                                    key={reason}
                                                                    className='text-xs leading-5 text-slate-600 dark:text-slate-300'
                                                                >
                                                                    • {reason}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : null}
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    )
    //#endregion render
}
//#endregion component

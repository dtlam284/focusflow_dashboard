import { useI18n } from '@/contexts/I18nContext'
import { Button } from '@/components/ui/button'
import type { ISmartLinkingPreferencesState } from '@/features/tasks/store/slices/smartLinkingPreferencesSlice'

//#region props
interface ISmartLinkingPreferencesCardProps {
    preferences: ISmartLinkingPreferencesState
    onEnabledChange: (value: boolean) => void
    onHideDismissedChange: (value: boolean) => void
    onShowReasonsChange: (value: boolean) => void
    onMaxSuggestionsChange: (value: 3 | 5 | 10) => void
    onReset: () => void
}
//#endregion props

//#region component
export function SmartLinkingPreferencesCard({
    preferences,
    onEnabledChange,
    onHideDismissedChange,
    onShowReasonsChange,
    onMaxSuggestionsChange,
    onReset,
}: ISmartLinkingPreferencesCardProps) {
    //#region hooks
    const { t } = useI18n()
    //#endregion hooks

    //#region render
    return (
        <section className='rounded-2xl border bg-card p-2.5 shadow-sm'>
            <div className='mb-2 flex items-center justify-between gap-3'>
                <div>
                    <h3 className='text-sm font-semibold text-foreground'>
                        {t('Smart linking preferences')}
                    </h3>
                    <p className='mt-1 text-xs text-muted-foreground'>
                        {t('')}
                    </p>
                </div>

                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={onReset}
                >
                    {t('Reset')}
                </Button>
            </div>

            <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
                <label className='flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                            {t('Show smart suggestions')}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {t('Enable task, note, link, and similar-task suggestions.')}
                        </p>
                    </div>

                    <input
                        type='checkbox'
                        checked={preferences.enabled}
                        onChange={(event) => onEnabledChange(event.target.checked)}
                        className='h-4 w-4'
                    />
                </label>

                <label className='flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                            {t('Hide dismissed')}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {t('Keep dismissed suggestions hidden across reloads.')}
                        </p>
                    </div>

                    <input
                        type='checkbox'
                        checked={preferences.hideDismissed}
                        onChange={(event) =>
                            onHideDismissedChange(event.target.checked)
                        }
                        className='h-4 w-4'
                    />
                </label>

                <label className='flex items-center justify-between gap-4 rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                            {t('Show reasons')}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {t('Show short explanation text under smart suggestions.')}
                        </p>
                    </div>

                    <input
                        type='checkbox'
                        checked={preferences.showReasons}
                        onChange={(event) =>
                            onShowReasonsChange(event.target.checked)
                        }
                        className='h-4 w-4'
                    />
                </label>

                <div className='rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-800'>
                    <div className='space-y-1'>
                        <p className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                            {t('Max suggestions')}
                        </p>
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {/* {t('Limit how many suggestion items appear per section.')} */}
                        </p>
                    </div>

                    <select
                        value={preferences.maxSuggestions}
                        onChange={(event) =>
                            onMaxSuggestionsChange(
                                Number(event.target.value) as 3 | 5 | 10,
                            )
                        }
                        className='mt-2 h-9 w-full rounded-xl border bg-background px-3 text-sm'
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                    </select>
                </div>
            </div>
        </section>
    )
    //#endregion render
}
//#endregion component

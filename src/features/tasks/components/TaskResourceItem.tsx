import { Eye, Paperclip, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

//#region props
interface ITaskResourceItemProps {
    title: string
    entityType: 'note' | 'link'
    metadata?: string
    variant: 'attached' | 'suggested'
    score?: number
    reasons?: string[]
    onAttach?: () => void
    onView?: () => void
    onDismiss?: () => void
}
//#endregion props

//#region helpers
const entityTypeLabels = {
    note: 'Note',
    link: 'Link',
} as const

const getScoreToneClassName = (score?: number) => {
    if (score == null) {
        return 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
    }

    if (score >= 12) {
        return 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
    }

    if (score >= 8) {
        return 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
    }

    return 'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
}
//#endregion helpers

//#region component
export function TaskResourceItem({
    title,
    entityType,
    metadata,
    variant,
    score,
    reasons = [],
    onAttach,
    onView,
    onDismiss,
}: ITaskResourceItemProps) {
    const visibleReasons =
        variant === 'suggested' ? reasons.slice(0, 2) : []

    //#region render
    return (
        <article className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='min-w-0 flex-1 space-y-1'>
                    <h4 className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
                        {title}
                    </h4>

                    {metadata ? (
                        <p className='text-xs text-slate-500 dark:text-slate-400'>
                            {metadata}
                        </p>
                    ) : null}
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                    <span className='inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'>
                        {entityTypeLabels[entityType]}
                    </span>

                    {variant === 'suggested' && score != null ? (
                        <span
                            className={cn(
                                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                                getScoreToneClassName(score),
                            )}
                        >
                            {score >= 12 ? 'Strong match' : score >= 8 ? 'Good match' : 'Possible match'}
                        </span>
                    ) : null}
                </div>
            </div>

            {variant === 'suggested' && visibleReasons.length > 0 ? (
                <div className='mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40'>
                    <div className='mb-2 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200'>
                        {/* <Sparkles className='h-3.5 w-3.5' /> */}
                        Why suggested
                    </div>

                    <ul className='space-y-1'>
                        {visibleReasons.map((reason) => (
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

            {onAttach || onView || onDismiss ? (
                <div className='mt-4 flex flex-wrap items-center gap-2'>
                    {onAttach ? (
                        <Button
                            type='button'
                            size='sm'
                            onClick={onAttach}
                        >
                            <Paperclip className='h-4 w-4' />
                            Attach
                        </Button>
                    ) : null}

                    {onView ? (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={onView}
                        >
                            <Eye className='h-4 w-4' />
                            View
                        </Button>
                    ) : null}

                    {onDismiss ? (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={onDismiss}
                            className='text-slate-600 dark:text-slate-300'
                        >
                            <X className='h-4 w-4' />
                            Dismiss
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </article>
    )
    //#endregion render
}
//#endregion component

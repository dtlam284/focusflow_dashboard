import * as React from 'react'

//#region props
interface ITaskResourceSectionProps {
    title: string
    emptyTitle: string
    emptyDescription: string
    itemCount: number
    children: React.ReactNode
}
//#endregion props

//#region component
export function TaskResourceSection({
    title,
    emptyTitle,
    emptyDescription,
    itemCount,
    children,
}: ITaskResourceSectionProps) {
    
    //#region render
    return (
        <section className='space-y-3'>
            <div className='flex items-center justify-between gap-3'>
                <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    {title}
                </h4>

                <span className='text-xs text-slate-500 dark:text-slate-400'>
                    {itemCount}
                </span>
            </div>

            {itemCount === 0 ? (
                <div className='rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-900/30'>
                    <p className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                        {emptyTitle}
                    </p> 
                    <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                        {emptyDescription}
                    </p>
                </div>
            ) : (
                <div className='space-y-3'>{children}</div>
            )}
        </section>
    )
    //#endregion render
}
//#endregion component

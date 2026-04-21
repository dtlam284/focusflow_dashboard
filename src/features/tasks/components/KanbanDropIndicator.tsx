import { cn } from '@/utils';

//#region types
interface IKanbanDropIndicatorProps {
    isActive?: boolean;
    label?: string;
    size?: 'inline' | 'block';
    className?: string;
}
//#endregion types

//#region component
export function KanbanDropIndicator({
    isActive = false,
    label,
    size = 'inline',
    className,
}: IKanbanDropIndicatorProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-dashed transition-colors',
                size === 'inline'
                    ? 'h-10'
                    : 'flex min-h-[96px] items-center justify-center px-4 py-6 text-center text-xs',
                isActive
                    ? 'border-blue-400/60 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                    : 'border-slate-200 bg-white/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400',
                className,
            )}
        >
            {label ? <span>{label}</span> : null}
        </div>
    );
}
//#endregion component

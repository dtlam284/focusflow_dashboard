import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/utils';

import { getTaskEffectiveStatus } from '../store/selectors/taskSelectors';
import { InlineTaskTitle } from './InlineTaskTitle'

import type { ITask, TaskComputedStatus, TaskStatus } from '../types/taskTypes';

//#region types
export interface IKanbanTaskCardProps {
    task: ITask;
    index: number;
    columnStatus: TaskStatus;
    onOpen: (task: ITask) => void;
    onEdit: (task: ITask) => void;
    onDelete: (taskId: string) => void;
}
//#endregion types

//#region constants
const statusStyles: Record<TaskComputedStatus, string> = {
    todo: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    in_progress:
        'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300',
    review:
        'border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300',
    done: 'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
    unfinished:
        'border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
};

const statusLabels: Record<TaskComputedStatus, string> = {
    todo: 'To do',
    in_progress: 'In progress',
    review: 'Review',
    done: 'Done',
    unfinished: 'Unfinished',
};

const priorityStyles: Record<ITask['priority'], string> = {
    low: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
    medium:
        'border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
    high: 'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300',
};

const priorityLabels: Record<ITask['priority'], string> = {
    low: 'Low priority',
    medium: 'Medium priority',
    high: 'High priority',
};
//#endregion constants

//#region component
export function KanbanTaskCard({
    task,
    index,
    columnStatus,
    onOpen,
    onEdit,
    onDelete,
}: IKanbanTaskCardProps) {
    //#region hooks
    const { t } = useI18n();

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'task',
            taskId: task.id,
            status: columnStatus,
            index,
        },
    });
    //#endregion hooks

    //#region derived values
    const effectiveStatus = getTaskEffectiveStatus(task);
    const isDone = task.status === 'done';

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    //#endregion derived values

    //#region handlers
    const handleOpen = () => {
        onOpen(task);
    };
    //#endregion handlers

    //#region render
    return (
        <article
            ref={setNodeRef}
            style={style}
            onClick={handleOpen}
            className={cn(
                'cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-950',
                !isDragging && 'hover:shadow-md',
                isDragging && 'z-10 opacity-40 shadow-lg ring-2 ring-blue-500/30',
            )}
        >
            <div className='space-y-3'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 space-y-1'>
                        <InlineTaskTitle
                            taskId={task.id}
                            title={task.title}
                            className={cn(
                                'line-clamp-2 text-sm font-semibold text-slate-900 dark:text-slate-100',
                                isDone && 'text-slate-500 line-through dark:text-slate-500',
                            )}
                        />

                        {task.description ? (
                            <p
                                className={cn(
                                    'line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400',
                                    isDone && 'text-slate-400 dark:text-slate-500',
                                )}
                            >
                                {task.description}
                            </p>
                        ) : null}
                    </div>

                    <div className='flex shrink-0 items-start gap-2'>
                        <span
                            className={cn(
                                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                                statusStyles[effectiveStatus],
                            )}
                        >
                            {t(statusLabels[effectiveStatus])}
                        </span>

                        <button
                            ref={setActivatorNodeRef}
                            type='button'
                            aria-label={t('Drag task')}
                            onClick={(event) => event.stopPropagation()}
                            className={cn(
                                'inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors',
                                'hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200',
                                isDragging && 'cursor-grabbing',
                            )}
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className='h-4 w-4' />
                        </button>
                    </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                    <span
                        className={cn(
                            'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                            priorityStyles[task.priority],
                        )}
                    >
                        {t(priorityLabels[task.priority])}
                    </span>

                    {task.dueDate ? (
                        <span className='inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400'>
                            <CalendarDays className='h-3.5 w-3.5' />
                            {t('Due')}: {task.dueDate}
                            {task.dueTime ? ` ${task.dueTime}` : ''}
                        </span>
                    ) : null}
                </div>

                <div className='flex items-center gap-2 pt-1'>
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className='flex-1'
                        onClick={(event) => {
                            event.stopPropagation();
                            onEdit(task);
                        }}
                    >
                        <Pencil className='h-4 w-4' />
                        {t('Edit')}
                    </Button>

                    <Button
                        type='button'
                        size='sm'
                        variant='destructive'
                        className='flex-1'
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(task.id);
                        }}
                    >
                        <Trash2 className='h-4 w-4' />
                        {t('Delete')}
                    </Button>
                </div>
            </div>
        </article>
    );
    //#endregion render
}
//#endregion component

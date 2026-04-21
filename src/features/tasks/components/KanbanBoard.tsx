import * as React from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { useAppDispatch } from '@/app/store/hooks';

import {
    moveTaskToColumn,
    reorderTasksInColumn,
} from '../store/slices/taskSlice';
import {
    TASK_STATUSES,
    type ITask,
    type ITaskBoardColumn,
    type TaskStatus,
} from '../types/taskTypes';
import {
    KanbanColumn,
    type IKanbanColumnDragPreview,
} from './KanbanColumn';
import { KanbanDragOverlay } from './KanbanDragOverlay';

//#region types
interface IKanbanBoardProps {
    tasks: ITask[];
    onEditTask: (task: ITask) => void;
    onDeleteTask: (taskId: string) => void;
}

interface IDragTaskData {
    type: 'task';
    taskId: string;
    status: TaskStatus;
    index: number;
}

interface IDragColumnData {
    type: 'column';
    status: TaskStatus;
}
//#endregion types

//#region helpers
const isTaskDragData = (value: unknown): value is IDragTaskData => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<IDragTaskData>;

    return (
        candidate.type === 'task' &&
        typeof candidate.taskId === 'string' &&
        typeof candidate.status === 'string' &&
        typeof candidate.index === 'number'
    );
};

const isColumnDragData = (value: unknown): value is IDragColumnData => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<IDragColumnData>;

    return candidate.type === 'column' && typeof candidate.status === 'string';
};

const getColumnTasks = (columns: ITaskBoardColumn[], status: TaskStatus): ITask[] => {
    return columns.find((column) => column.status === status)?.tasks ?? [];
};

const getTaskIndexById = (
    columns: ITaskBoardColumn[],
    status: TaskStatus,
    taskId: string,
): number => {
    return getColumnTasks(columns, status).findIndex((task) => task.id === taskId);
};

const strictPointerCollision: CollisionDetection = (args) => {
    if (args.pointerCoordinates) {
        return pointerWithin(args);
    }

    return rectIntersection(args);
};

const getPreviewFromOverData = (
    columns: ITaskBoardColumn[],
    overData: unknown,
): IKanbanColumnDragPreview | null => {
    if (isTaskDragData(overData)) {
        const targetIndex = getTaskIndexById(columns, overData.status, overData.taskId);

        if (targetIndex === -1) {
            return null;
        }

        return {
            status: overData.status,
            index: targetIndex,
        };
    }

    if (isColumnDragData(overData)) {
        return {
            status: overData.status,
            index: getColumnTasks(columns, overData.status).length,
        };
    }

    return null;
};
//#endregion helpers

//#region component
export function KanbanBoard({
    tasks,
    onEditTask,
    onDeleteTask,
}: IKanbanBoardProps) {
    //#region hooks
    const dispatch = useAppDispatch();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    //#endregion hooks

    //#region local state
    const [activeTaskId, setActiveTaskId] = React.useState<UniqueIdentifier | null>(null);
    const [dragPreview, setDragPreview] = React.useState<IKanbanColumnDragPreview | null>(null);
    //#endregion local state

    //#region derived values
    const columns = React.useMemo<ITaskBoardColumn[]>(() => {
        return TASK_STATUSES.map((status) => ({
            status,
            tasks: tasks
                .filter((task) => task.status === status)
                .sort((a, b) => a.order - b.order),
        }));
    }, [tasks]);

    const activeTask = React.useMemo(() => {
        if (!activeTaskId) {
            return null;
        }

        return tasks.find((task) => task.id === activeTaskId) ?? null;
    }, [activeTaskId, tasks]);
    //#endregion derived values

    //#region handlers
    const clearDragState = () => {
        setActiveTaskId(null);
        setDragPreview(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const activeData = event.active.data.current;

        if (!isTaskDragData(activeData)) {
            return;
        }

        setActiveTaskId(activeData.taskId);
        setDragPreview({
            status: activeData.status,
            index: activeData.index,
        });
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;

        if (!over) {
            setDragPreview(null);
            return;
        }

        const preview = getPreviewFromOverData(columns, over.data.current);
        setDragPreview(preview);
    };

    const handleDragCancel = () => {
        clearDragState();
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            clearDragState();
            return;
        }

        const activeData = active.data.current;
        const overData = over.data.current;

        if (!isTaskDragData(activeData)) {
            clearDragState();
            return;
        }

        const sourceStatus = activeData.status;
        const activeTaskIdValue = activeData.taskId;
        const destination = getPreviewFromOverData(columns, overData);

        if (!destination) {
            clearDragState();
            return;
        }

        if (sourceStatus === destination.status) {
            const sourceIndex = getTaskIndexById(columns, sourceStatus, activeTaskIdValue);

            if (sourceIndex === -1) {
                clearDragState();
                return;
            }

            if (sourceIndex !== destination.index) {
                dispatch(
                    reorderTasksInColumn({
                        status: sourceStatus,
                        fromIndex: sourceIndex,
                        toIndex: destination.index,
                    }),
                );
            }

            clearDragState();
            return;
        }

        dispatch(
            moveTaskToColumn({
                taskId: activeTaskIdValue,
                toStatus: destination.status,
                toIndex: destination.index,
            }),
        );

        clearDragState();
    };
    //#endregion handlers

    //#region render
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={strictPointerCollision}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
        >
            <div className='grid gap-4 md:grid-cols-2 2xl:grid-cols-4'>
                {columns.map((column) => (
                    <KanbanColumn
                        key={column.status}
                        column={column}
                        dragPreview={dragPreview}
                        isDraggingTask={Boolean(activeTaskId)}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <KanbanDragOverlay task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
    //#endregion render
}
//#endregion component

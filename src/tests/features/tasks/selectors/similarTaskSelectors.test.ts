import { describe, expect, it } from 'vitest'
import { selectSimilarTasksByTaskId } from '@/features/tasks/store/selectors/taskRelationsSelectors'
import type { RootState } from '@/app/store/store'
import type { ILinksState } from '@/features/links/types/linkTypes'
import type { INotesState } from '@/features/notes/types/noteTypes'
import type { ITaskRelationsState } from '@/features/tasks/types/taskRelationTypes'
import type { ITask, ITasksState } from '@/features/tasks/types/taskTypes'

//#region helpers
const createTask = (overrides: Partial<ITask> = {}): ITask => ({
    id: 'task-1',
    title: 'Frontend accessibility review',
    description: 'Review dashboard filters and keyboard navigation',
    status: 'todo',
    priority: 'high',
    order: 1,
    labelIds: ['frontend'],
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
    ...overrides,
})

const createTasksState = (items: ITask[]): ITasksState => ({
    items,
    filters: {
        status: 'all',
        priority: 'all',
        keyword: '',
        labelId: 'all',
    },
})

const createNotesState = (): INotesState => ({
    items: [],
    filters: {
        keyword: '',
    },
})

const createLinksState = (): ILinksState => ({
    items: [],
    filters: {
        keyword: '',
        category: 'all',
    },
})

const createTaskRelationsState = (
    overrides: Partial<ITaskRelationsState> = {},
): ITaskRelationsState => ({
    taskNoteRefs: [],
    taskLinkRefs: [],
    dismissedSuggestions: [],
    recentAttachmentSignals: [],
    ...overrides,
})

const createRootState = ({
    tasks,
    taskRelations,
}: {
    tasks: ITasksState
    taskRelations: ITaskRelationsState
}): RootState =>
    ({
        app: {
            initialized: false,
            pageTitle: '',
            isSidebarCollapsed: false,
        },
        auth: {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isSubmitting: false,
            error: null,
        },
        tasks,
        taskDetail: {
            selectedTaskId: null,
            isOpen: false,
        },
        taskComments: {
            byTaskId: {},
        },
        taskActivity: {
            items: [],
        },
        taskLabels: {
            items: [],
        },
        taskRelations,
        board: {
            showCompleted: true,
            sortMode: 'newest',
            groupMode: 'status',
        },
        notes: createNotesState(),
        noteDetail: {
            selectedNoteId: null,
            isOpen: false,
        },
        links: createLinksState(),
        linkDetail: {
            selectedLinkId: null,
            isOpen: false,
        },
        _persist: {
            version: -1,
            rehydrated: true,
        },
    }) as RootState
//#endregion helpers

//#region tests
describe('similarTaskSelectors', () => {
    it('returns sorted similar tasks and excludes the current task', () => {
        const baseTask = createTask({ id: 'task-base' })

        const strongTask = createTask({
            id: 'task-strong',
            title: 'Accessibility dashboard planning',
            description: 'Keyboard navigation improvements',
            labelIds: ['frontend'],
        })

        const mediumTask = createTask({
            id: 'task-medium',
            title: 'Accessibility workflow cleanup',
            description: 'Process review',
            labelIds: ['other'],
        })

        const weakTask = createTask({
            id: 'task-weak',
            title: 'Buy groceries',
            description: 'Milk and fruit',
            labelIds: ['personal'],
        })

        const state = createRootState({
            tasks: createTasksState([baseTask, strongTask, mediumTask, weakTask]),
            taskRelations: createTaskRelationsState({
                taskNoteRefs: [
                    {
                        id: 'task-note:task-base:note-a',
                        taskId: 'task-base',
                        noteId: 'note-a',
                        createdAt: '2026-04-28T00:00:00.000Z',
                    },
                    {
                        id: 'task-note:task-medium:note-a',
                        taskId: 'task-medium',
                        noteId: 'note-a',
                        createdAt: '2026-04-28T00:00:00.000Z',
                    },
                    {
                        id: 'task-note:task-strong:note-a',
                        taskId: 'task-strong',
                        noteId: 'note-a',
                        createdAt: '2026-04-28T00:00:00.000Z',
                    },
                ],
                taskLinkRefs: [
                    {
                        id: 'task-link:task-base:link-a',
                        taskId: 'task-base',
                        linkId: 'link-a',
                        createdAt: '2026-04-28T00:00:00.000Z',
                    },
                    {
                        id: 'task-link:task-strong:link-a',
                        taskId: 'task-strong',
                        linkId: 'link-a',
                        createdAt: '2026-04-28T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectSimilarTasksByTaskId(state, 'task-base')

        expect(result.map((item) => item.entity.id)).toEqual([
            'task-strong',
            'task-medium',
        ])
        expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0)
        expect(result[0]?.reasons.length).toBeGreaterThan(0)
        expect(result.some((item) => item.entity.id === 'task-base')).toBe(false)
    })

    it('returns an empty array when the task does not exist', () => {
        const state = createRootState({
            tasks: createTasksState([]),
            taskRelations: createTaskRelationsState(),
        })

        expect(selectSimilarTasksByTaskId(state, 'missing-task')).toEqual([])
    })
})
//#endregion tests

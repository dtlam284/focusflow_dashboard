import { describe, expect, it } from 'vitest'
import {
    selectRelatedTasksByLinkId,
    selectRelatedTasksByNoteId,
    selectSuggestedTasksByLinkId,
    selectSuggestedTasksByNoteId,
} from '@/features/tasks/store/selectors/taskRelationsSelectors'
import type { RootState } from '@/app/store/store'
import type { ILink, ILinksState } from '@/features/links/types/linkTypes'
import type { INote, INotesState } from '@/features/notes/types/noteTypes'
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
    createdAt: '2026-04-24T00:00:00.000Z',
    updatedAt: '2026-04-24T00:00:00.000Z',
    ...overrides,
})

const createNote = (overrides: Partial<INote> = {}): INote => ({
    id: 'note-1',
    title: 'Accessibility checklist',
    content: 'Keyboard navigation review for dashboard filters',
    color: 'blue',
    category: 'learning',
    isPinned: false,
    createdAt: '2026-04-24T00:00:00.000Z',
    updatedAt: '2026-04-24T00:00:00.000Z',
    ...overrides,
})

const createLink = (overrides: Partial<ILink> = {}): ILink => ({
    id: 'link-1',
    title: 'Keyboard navigation patterns',
    url: 'https://example.com/keyboard-navigation-patterns',
    category: 'design',
    createdAt: '2026-04-24T00:00:00.000Z',
    updatedAt: '2026-04-24T00:00:00.000Z',
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

const createNotesState = (items: INote[]): INotesState => ({
    items,
    filters: {
        keyword: '',
    },
})

const createLinksState = (items: ILink[]): ILinksState => ({
    items,
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
    notes,
    links,
    taskRelations,
}: {
    tasks: ITasksState
    notes: INotesState
    links: ILinksState
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
        notes,
        links,
        noteDetail: {
            selectedNoteId: null,
            isOpen: false,
        },
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
describe('reverseTaskRelationsSelectors', () => {
    it('returns related tasks for a note', () => {
        const note = createNote({ id: 'note-related' })

        const relatedTask = createTask({ id: 'task-related' })
        const unrelatedTask = createTask({
            id: 'task-unrelated',
            title: 'Marketing campaign plan',
            description: 'Prepare ads and landing pages',
        })

        const state = createRootState({
            tasks: createTasksState([relatedTask, unrelatedTask]),
            notes: createNotesState([note]),
            links: createLinksState([]),
            taskRelations: createTaskRelationsState({
                taskNoteRefs: [
                    {
                        id: 'task-note:task-related:note-related',
                        taskId: 'task-related',
                        noteId: 'note-related',
                        createdAt: '2026-04-24T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectRelatedTasksByNoteId(state, 'note-related')

        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('task-related')
    })

    it('returns related tasks for a link', () => {
        const link = createLink({ id: 'link-related' })

        const relatedTask = createTask({ id: 'task-related' })
        const unrelatedTask = createTask({
            id: 'task-unrelated',
            title: 'Marketing campaign plan',
            description: 'Prepare ads and landing pages',
        })

        const state = createRootState({
            tasks: createTasksState([relatedTask, unrelatedTask]),
            notes: createNotesState([]),
            links: createLinksState([link]),
            taskRelations: createTaskRelationsState({
                taskLinkRefs: [
                    {
                        id: 'task-link:task-related:link-related',
                        taskId: 'task-related',
                        linkId: 'link-related',
                        createdAt: '2026-04-24T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectRelatedTasksByLinkId(state, 'link-related')

        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('task-related')
    })

    it('returns suggested tasks for a note and excludes already related tasks', () => {
        const note = createNote({ id: 'note-1' })

        const relatedTask = createTask({
            id: 'task-related',
            title: 'Accessibility review',
        })
        const strongTask = createTask({
            id: 'task-strong',
            title: 'Accessibility dashboard review',
            description: 'Keyboard navigation and filters audit',
        })
        const weakTask = createTask({
            id: 'task-weak',
            title: 'Buy groceries',
            description: 'Milk and fruit',
        })

        const state = createRootState({
            tasks: createTasksState([relatedTask, strongTask, weakTask]),
            notes: createNotesState([note]),
            links: createLinksState([]),
            taskRelations: createTaskRelationsState({
                taskNoteRefs: [
                    {
                        id: 'task-note:task-related:note-1',
                        taskId: 'task-related',
                        noteId: 'note-1',
                        createdAt: '2026-04-24T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectSuggestedTasksByNoteId(state, 'note-1')

        expect(result).toHaveLength(1)
        expect(result[0]?.entity.id).toBe('task-strong')
        expect(result[0]?.score).toBeGreaterThan(0)
        expect(result[0]?.reasons.length).toBeGreaterThan(0)
    })

    it('returns suggested tasks for a link and excludes already related tasks', () => {
        const link = createLink({ id: 'link-1' })

        const relatedTask = createTask({
            id: 'task-related',
            title: 'Keyboard navigation review',
        })
        const strongTask = createTask({
            id: 'task-strong',
            title: 'Keyboard navigation patterns audit',
            description: 'Review accessibility behavior',
        })
        const weakTask = createTask({
            id: 'task-weak',
            title: 'Cooking recipes',
            description: 'Weekend dinner ideas',
        })

        const state = createRootState({
            tasks: createTasksState([relatedTask, strongTask, weakTask]),
            notes: createNotesState([]),
            links: createLinksState([link]),
            taskRelations: createTaskRelationsState({
                taskLinkRefs: [
                    {
                        id: 'task-link:task-related:link-1',
                        taskId: 'task-related',
                        linkId: 'link-1',
                        createdAt: '2026-04-24T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectSuggestedTasksByLinkId(state, 'link-1')

        expect(result).toHaveLength(1)
        expect(result[0]?.entity.id).toBe('task-strong')
        expect(result[0]?.score).toBeGreaterThan(0)
        expect(result[0]?.reasons.length).toBeGreaterThan(0)
    })

    it('adds a recent attachment bonus for reverse task suggestions', () => {
        const note = createNote({ id: 'note-recent' })

        const task = createTask({
            id: 'task-recent',
            title: 'Accessibility review',
            description: 'Keyboard navigation dashboard audit',
        })

        const state = createRootState({
            tasks: createTasksState([task]),
            notes: createNotesState([note]),
            links: createLinksState([]),
            taskRelations: createTaskRelationsState({
                recentAttachmentSignals: [
                    {
                        id: 'recent:task-recent:note:note-recent',
                        taskId: 'task-recent',
                        entityType: 'note',
                        entityId: 'note-recent',
                        attachedAt: '2026-04-24T00:00:00.000Z',
                    },
                ],
            }),
        })

        const result = selectSuggestedTasksByNoteId(state, 'note-recent')

        expect(result).toHaveLength(1)
        expect(result[0]?.score).toBe(21)
        expect(result[0]?.reasons).toContain(
            'Recently attached in a similar task context',
        )
    })
})
//#endregion tests

import { describe, expect, it } from 'vitest'
import taskRelationsReducer, {
    clearAllDismissedSuggestions,
    clearDismissedSuggestionsForTask,
    dismissSuggestion,
    restoreDismissedSuggestion,
} from '@/features/tasks/store/slices/taskRelationsSlice'
import type { ITaskRelationsState } from '@/features/tasks/types/taskRelationTypes'

//#region helpers
const createInitialState = (): ITaskRelationsState => ({
    taskNoteRefs: [],
    taskLinkRefs: [],
    dismissedSuggestions: [],
    recentAttachmentSignals: [],
})
//#endregion helpers

//#region tests
describe('taskRelationsSlice', () => {
    it('adds a dismissed suggestion without touching other state', () => {
        const initialState = createInitialState()

        const nextState = taskRelationsReducer(
            initialState,
            dismissSuggestion({
                taskId: 'task-1',
                entityType: 'note',
                entityId: 'note-1',
                dismissedAt: '2026-04-24T00:00:00.000Z',
            }),
        )

        expect(nextState.dismissedSuggestions).toHaveLength(1)
        expect(nextState.dismissedSuggestions[0]).toMatchObject({
            taskId: 'task-1',
            entityType: 'note',
            entityId: 'note-1',
        })
        expect(nextState.taskNoteRefs).toEqual([])
        expect(nextState.taskLinkRefs).toEqual([])
    })

    it('does not duplicate the same dismissed suggestion', () => {
        const initialState = createInitialState()

        const onceDismissed = taskRelationsReducer(
            initialState,
            dismissSuggestion({
                taskId: 'task-1',
                entityType: 'link',
                entityId: 'link-1',
                dismissedAt: '2026-04-24T00:00:00.000Z',
            }),
        )

        const twiceDismissed = taskRelationsReducer(
            onceDismissed,
            dismissSuggestion({
                taskId: 'task-1',
                entityType: 'link',
                entityId: 'link-1',
                dismissedAt: '2026-04-24T00:01:00.000Z',
            }),
        )

        expect(twiceDismissed.dismissedSuggestions).toHaveLength(1)
    })

    it('restores one dismissed suggestion without affecting others', () => {
        const initialState: ITaskRelationsState = {
            ...createInitialState(),
            dismissedSuggestions: [
                {
                    id: 'dismissed:task-1:note:note-1',
                    taskId: 'task-1',
                    entityType: 'note',
                    entityId: 'note-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
                {
                    id: 'dismissed:task-2:note:note-1',
                    taskId: 'task-2',
                    entityType: 'note',
                    entityId: 'note-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
            ],
        }

        const nextState = taskRelationsReducer(
            initialState,
            restoreDismissedSuggestion({
                taskId: 'task-1',
                entityType: 'note',
                entityId: 'note-1',
            }),
        )

        expect(nextState.dismissedSuggestions).toHaveLength(1)
        expect(nextState.dismissedSuggestions[0]).toMatchObject({
            taskId: 'task-2',
            entityId: 'note-1',
        })
    })

    it('clears dismissed suggestions only for one task', () => {
        const initialState: ITaskRelationsState = {
            ...createInitialState(),
            dismissedSuggestions: [
                {
                    id: 'dismissed:task-1:note:note-1',
                    taskId: 'task-1',
                    entityType: 'note',
                    entityId: 'note-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
                {
                    id: 'dismissed:task-2:link:link-1',
                    taskId: 'task-2',
                    entityType: 'link',
                    entityId: 'link-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
            ],
        }

        const nextState = taskRelationsReducer(
            initialState,
            clearDismissedSuggestionsForTask('task-1'),
        )

        expect(nextState.dismissedSuggestions).toHaveLength(1)
        expect(nextState.dismissedSuggestions[0]).toMatchObject({
            taskId: 'task-2',
            entityId: 'link-1',
        })
    })

    it('clears all dismissed suggestions for future settings reset flows', () => {
        const initialState: ITaskRelationsState = {
            ...createInitialState(),
            dismissedSuggestions: [
                {
                    id: 'dismissed:task-1:note:note-1',
                    taskId: 'task-1',
                    entityType: 'note',
                    entityId: 'note-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
                {
                    id: 'dismissed:task-2:link:link-1',
                    taskId: 'task-2',
                    entityType: 'link',
                    entityId: 'link-1',
                    dismissedAt: '2026-04-24T00:00:00.000Z',
                },
            ],
        }

        const nextState = taskRelationsReducer(
            initialState,
            clearAllDismissedSuggestions(),
        )

        expect(nextState.dismissedSuggestions).toEqual([])
    })
})
//#endregion tests

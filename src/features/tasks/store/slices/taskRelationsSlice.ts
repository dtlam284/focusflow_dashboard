import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type {
    IDismissedSuggestion,
    IRecentAttachmentSignal,
    ITaskLinkRef,
    ITaskNoteRef,
    ITaskRelationsState,
    SmartLinkedEntityType,
} from '@/features/tasks/types/taskRelationTypes'

//#region helpers
const createTaskNoteRefId = (taskId: string, noteId: string) =>
    `task-note:${taskId}:${noteId}`

const createTaskLinkRefId = (taskId: string, linkId: string) =>
    `task-link:${taskId}:${linkId}`

const createDismissedSuggestionId = (
    taskId: string,
    entityType: SmartLinkedEntityType,
    entityId: string,
) => `dismissed:${taskId}:${entityType}:${entityId}`

const createRecentAttachmentSignalId = (
    taskId: string,
    entityType: SmartLinkedEntityType,
    entityId: string,
) => `recent:${taskId}:${entityType}:${entityId}`

const removeDismissedSuggestion = (
    dismissedSuggestions: IDismissedSuggestion[],
    taskId: string,
    entityType: SmartLinkedEntityType,
    entityId: string,
) =>
    dismissedSuggestions.filter(
        (item) =>
            !(
                item.taskId === taskId &&
                item.entityType === entityType &&
                item.entityId === entityId
            ),
    )

const upsertRecentAttachmentSignal = (
    signals: IRecentAttachmentSignal[],
    nextSignal: IRecentAttachmentSignal,
) => {
    const existingIndex = signals.findIndex(
        (item) =>
            item.taskId === nextSignal.taskId &&
            item.entityType === nextSignal.entityType &&
            item.entityId === nextSignal.entityId,
    )

    if (existingIndex >= 0) {
        signals[existingIndex] = nextSignal
        return
    }

    signals.unshift(nextSignal)
}
//#endregion helpers

//#region payloads
interface IAttachNoteToTaskPayload {
    taskId: string
    noteId: string
    createdAt: string
}

interface IDetachNoteFromTaskPayload {
    taskId: string
    noteId: string
}

interface IAttachLinkToTaskPayload {
    taskId: string
    linkId: string
    createdAt: string
}

interface IDetachLinkFromTaskPayload {
    taskId: string
    linkId: string
}

interface IDismissSuggestionPayload {
    taskId: string
    entityType: SmartLinkedEntityType
    entityId: string
    dismissedAt: string
}

interface IRestoreDismissedSuggestionPayload {
    taskId: string
    entityType: SmartLinkedEntityType
    entityId: string
}
//#endregion payloads

//#region state
const initialState: ITaskRelationsState = {
    taskNoteRefs: [],
    taskLinkRefs: [],
    dismissedSuggestions: [],
    recentAttachmentSignals: [],
}
//#endregion state

//#region slice
const taskRelationsSlice = createSlice({
    name: 'taskRelations',
    initialState,
    reducers: {
        hydrateTaskRelations: (
            state,
            action: PayloadAction<ITaskRelationsState | undefined>,
        ) => {
            if (!action.payload) {
                return
            }

            state.taskNoteRefs = action.payload.taskNoteRefs ?? []
            state.taskLinkRefs = action.payload.taskLinkRefs ?? []
            state.dismissedSuggestions = action.payload.dismissedSuggestions ?? []
            state.recentAttachmentSignals =
                action.payload.recentAttachmentSignals ?? []
        },

        attachNoteToTask: (
            state,
            action: PayloadAction<IAttachNoteToTaskPayload>,
        ) => {
            const { taskId, noteId, createdAt } = action.payload

            const alreadyAttached = state.taskNoteRefs.some(
                (item) => item.taskId === taskId && item.noteId === noteId,
            )

            if (alreadyAttached) {
                return
            }

            const nextRef: ITaskNoteRef = {
                id: createTaskNoteRefId(taskId, noteId),
                taskId,
                noteId,
                createdAt,
            }

            state.taskNoteRefs.unshift(nextRef)

            state.dismissedSuggestions = removeDismissedSuggestion(
                state.dismissedSuggestions,
                taskId,
                'note',
                noteId,
            )

            upsertRecentAttachmentSignal(state.recentAttachmentSignals, {
                id: createRecentAttachmentSignalId(taskId, 'note', noteId),
                taskId,
                entityType: 'note',
                entityId: noteId,
                attachedAt: createdAt,
            })
        },

        detachNoteFromTask: (
            state,
            action: PayloadAction<IDetachNoteFromTaskPayload>,
        ) => {
            const { taskId, noteId } = action.payload

            state.taskNoteRefs = state.taskNoteRefs.filter(
                (item) => !(item.taskId === taskId && item.noteId === noteId),
            )
        },

        attachLinkToTask: (
            state,
            action: PayloadAction<IAttachLinkToTaskPayload>,
        ) => {
            const { taskId, linkId, createdAt } = action.payload

            const alreadyAttached = state.taskLinkRefs.some(
                (item) => item.taskId === taskId && item.linkId === linkId,
            )

            if (alreadyAttached) {
                return
            }

            const nextRef: ITaskLinkRef = {
                id: createTaskLinkRefId(taskId, linkId),
                taskId,
                linkId,
                createdAt,
            }

            state.taskLinkRefs.unshift(nextRef)

            state.dismissedSuggestions = removeDismissedSuggestion(
                state.dismissedSuggestions,
                taskId,
                'link',
                linkId,
            )

            upsertRecentAttachmentSignal(state.recentAttachmentSignals, {
                id: createRecentAttachmentSignalId(taskId, 'link', linkId),
                taskId,
                entityType: 'link',
                entityId: linkId,
                attachedAt: createdAt,
            })
        },

        detachLinkFromTask: (
            state,
            action: PayloadAction<IDetachLinkFromTaskPayload>,
        ) => {
            const { taskId, linkId } = action.payload

            state.taskLinkRefs = state.taskLinkRefs.filter(
                (item) => !(item.taskId === taskId && item.linkId === linkId),
            )
        },

        dismissSuggestion: (
            state,
            action: PayloadAction<IDismissSuggestionPayload>,
        ) => {
            const { taskId, entityType, entityId, dismissedAt } = action.payload

            const alreadyDismissed = state.dismissedSuggestions.some(
                (item) =>
                    item.taskId === taskId &&
                    item.entityType === entityType &&
                    item.entityId === entityId,
            )

            if (alreadyDismissed) {
                return
            }

            state.dismissedSuggestions.unshift({
                id: createDismissedSuggestionId(taskId, entityType, entityId),
                taskId,
                entityType,
                entityId,
                dismissedAt,
            })
        },

        restoreDismissedSuggestion: (
            state,
            action: PayloadAction<IRestoreDismissedSuggestionPayload>,
        ) => {
            const { taskId, entityType, entityId } = action.payload

            state.dismissedSuggestions = state.dismissedSuggestions.filter(
                (item) =>
                    !(
                        item.taskId === taskId &&
                        item.entityType === entityType &&
                        item.entityId === entityId
                    ),
            )
        },

        clearDismissedSuggestionsForTask: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.dismissedSuggestions = state.dismissedSuggestions.filter(
                (item) => item.taskId !== action.payload,
            )
        },

        clearAllDismissedSuggestions: (state) => {
            state.dismissedSuggestions = []
        },

        clearRecentAttachmentSignalsForTask: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.recentAttachmentSignals = state.recentAttachmentSignals.filter(
                (item) => item.taskId !== action.payload,
            )
        },
    },
})
//#endregion slice

//#region exports
export const {
    hydrateTaskRelations,
    attachNoteToTask,
    detachNoteFromTask,
    attachLinkToTask,
    detachLinkFromTask,
    dismissSuggestion,
    restoreDismissedSuggestion,
    clearDismissedSuggestionsForTask,
    clearAllDismissedSuggestions,
    clearRecentAttachmentSignalsForTask,
} = taskRelationsSlice.actions

export default taskRelationsSlice.reducer
//#endregion exports

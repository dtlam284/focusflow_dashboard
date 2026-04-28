import { createSelector } from '@reduxjs/toolkit'
import {
    scoreLinkSuggestionForTask,
    scoreNoteSuggestionForTask,
    scoreSimilarTaskForTask,
    scoreTaskSuggestionForLink,
    scoreTaskSuggestionForNote,
} from '@/features/tasks/utils/smartLinkingScoring'
import {
    applySuggestionQualityGate,
    SIMILAR_TASK_MIN_SUGGESTION_SCORE,
    SMART_LINKING_MIN_SUGGESTION_SCORE,
} from '@/features/tasks/utils/smartLinkingQuality'
import type { RootState } from '@/app/store/store'
import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ITask } from '@/features/tasks/types/taskTypes'
import type { SmartLinkedEntityType } from '@/features/tasks/types/taskRelationTypes'


//#region props
export interface ISuggestedNoteResult {
    entityType: 'note'
    entity: INote
    score: number
    reasons: string[]
}

export interface ISuggestedLinkResult {
    entityType: 'link'
    entity: ILink
    score: number
    reasons: string[]
}

export interface ISuggestedTaskResult {
    entityType: 'task'
    entity: ITask
    score: number
    reasons: string[]
}

export type SuggestedTaskEntityResult =
    | ISuggestedNoteResult
    | ISuggestedLinkResult

export type SimilarTaskResult = ISuggestedTaskResult
//#endregion props

//#region base selectors
export const selectTaskRelationsState = (state: RootState) => state.taskRelations
export const selectTaskNoteRefs = (state: RootState) => state.taskRelations.taskNoteRefs
export const selectTaskLinkRefs = (state: RootState) => state.taskRelations.taskLinkRefs
export const selectDismissedSuggestions = (state: RootState) =>
    state.taskRelations.dismissedSuggestions
export const selectRecentAttachmentSignals = (state: RootState) =>
    state.taskRelations.recentAttachmentSignals
//#endregion base selectors

//#region helpers
const createEntityLookupKey = (
    entityType: SmartLinkedEntityType,
    entityId: string,
) => `${entityType}:${entityId}`

const getUniqueIntersectionCount = (
    leftIds: string[],
    rightIds: string[],
): number => {
    const rightIdSet = new Set(rightIds)

    return Array.from(new Set(leftIds)).filter((id) => rightIdSet.has(id)).length
}
//#endregion helpers

//#region task selectors
export const selectTaskById = createSelector(
    [
        (state: RootState) => state.tasks.items,
        (_state: RootState, taskId: string) => taskId,
    ],
    (tasks, taskId) => tasks.find((task) => task.id === taskId) ?? null,
)

export const selectAllTasks = (state: RootState) => state.tasks.items
//#endregion task selectors

//#region note and link selectors
export const selectNoteById = createSelector(
    [
        (state: RootState) => state.notes.items,
        (_state: RootState, noteId: string) => noteId,
    ],
    (notes, noteId) => notes.find((note) => note.id === noteId) ?? null,
)
 
export const selectLinkById = createSelector(
    [
        (state: RootState) => state.links.items,
        (_state: RootState, linkId: string) => linkId,
    ],
    (links, linkId) => links.find((link) => link.id === linkId) ?? null,
)
//#endregion note and link selectors

//#region relation selectors
export const selectTaskNoteRefsByTaskId = createSelector(
    [selectTaskNoteRefs, (_state: RootState, taskId: string) => taskId],
    (taskNoteRefs, taskId) =>
        taskNoteRefs.filter((item) => item.taskId === taskId),
)

export const selectTaskLinkRefsByTaskId = createSelector(
    [selectTaskLinkRefs, (_state: RootState, taskId: string) => taskId],
    (taskLinkRefs, taskId) =>
        taskLinkRefs.filter((item) => item.taskId === taskId),
)

export const selectTaskNoteRefsByNoteId = createSelector(
    [selectTaskNoteRefs, (_state: RootState, noteId: string) => noteId],
    (taskNoteRefs, noteId) =>
        taskNoteRefs.filter((item) => item.noteId === noteId),
)

export const selectTaskLinkRefsByLinkId = createSelector(
    [selectTaskLinkRefs, (_state: RootState, linkId: string) => linkId],
    (taskLinkRefs, linkId) =>
        taskLinkRefs.filter((item) => item.linkId === linkId),
)

export const selectAttachedNoteIdsByTaskId = createSelector(
    [selectTaskNoteRefsByTaskId],
    (taskNoteRefs) => taskNoteRefs.map((item) => item.noteId),
)

export const selectAttachedLinkIdsByTaskId = createSelector(
    [selectTaskLinkRefsByTaskId],
    (taskLinkRefs) => taskLinkRefs.map((item) => item.linkId),
)

export const selectRelatedTaskIdsByNoteId = createSelector(
    [selectTaskNoteRefsByNoteId],
    (taskNoteRefs) => taskNoteRefs.map((item) => item.taskId),
)

export const selectRelatedTaskIdsByLinkId = createSelector(
    [selectTaskLinkRefsByLinkId],
    (taskLinkRefs) => taskLinkRefs.map((item) => item.taskId),
)

export const selectAttachedNotesByTaskId = createSelector(
    [(state: RootState) => state.notes.items, selectAttachedNoteIdsByTaskId],
    (notes, attachedNoteIds) =>
        notes.filter((note) => attachedNoteIds.includes(note.id)),
)

export const selectAttachedLinksByTaskId = createSelector(
    [(state: RootState) => state.links.items, selectAttachedLinkIdsByTaskId],
    (links, attachedLinkIds) =>
        links.filter((link) => attachedLinkIds.includes(link.id)),
)

export const selectRelatedTasksByNoteId = createSelector(
    [selectAllTasks, selectRelatedTaskIdsByNoteId],
    (tasks, relatedTaskIds) =>
        tasks.filter((task) => relatedTaskIds.includes(task.id)),
)

export const selectRelatedTasksByLinkId = createSelector(
    [selectAllTasks, selectRelatedTaskIdsByLinkId],
    (tasks, relatedTaskIds) =>
        tasks.filter((task) => relatedTaskIds.includes(task.id)),
)
//#endregion relation selectors

//#region dismissed selectors
export const selectDismissedSuggestionsByTaskId = createSelector(
    [selectDismissedSuggestions, (_state: RootState, taskId: string) => taskId],
    (dismissedSuggestions, taskId) =>
        dismissedSuggestions.filter((item) => item.taskId === taskId),
)

export const selectDismissedSuggestionKeySetByTaskId = createSelector(
    [selectDismissedSuggestionsByTaskId],
    (dismissedSuggestions) =>
        new Set(
            dismissedSuggestions.map((item) =>
                createEntityLookupKey(item.entityType, item.entityId),
            ),
        ),
)

export const selectIsSuggestionDismissed = createSelector(
    [
        selectDismissedSuggestions,
        (_state: RootState, taskId: string) => taskId,
        (_state: RootState, _taskId: string, entityType: SmartLinkedEntityType) =>
            entityType,
        (
            _state: RootState,
            _taskId: string,
            _entityType: SmartLinkedEntityType,
            entityId: string,
        ) => entityId,
    ],
    (dismissedSuggestions, taskId, entityType, entityId) =>
        dismissedSuggestions.some(
            (item) =>
                item.taskId === taskId &&
                item.entityType === entityType &&
                item.entityId === entityId,
        ),
)
//#endregion dismissed selectors

//#region recent signals
export const selectRecentAttachmentSignalsByTaskId = createSelector(
    [selectRecentAttachmentSignals, (_state: RootState, taskId: string) => taskId],
    (recentAttachmentSignals, taskId) =>
        recentAttachmentSignals.filter((item) => item.taskId === taskId),
)

export const selectRecentAttachmentSignalKeySetByTaskId = createSelector(
    [selectRecentAttachmentSignalsByTaskId],
    (recentAttachmentSignals) =>
        new Set(
            recentAttachmentSignals.map((item) =>
                createEntityLookupKey(item.entityType, item.entityId),
            ),
        ),
)

export const selectRecentTaskIdSetByNoteId = createSelector(
    [selectRecentAttachmentSignals, (_state: RootState, noteId: string) => noteId],
    (recentAttachmentSignals, noteId) =>
        new Set(
            recentAttachmentSignals
                .filter(
                    (item) =>
                        item.entityType === 'note' && item.entityId === noteId,
                )
                .map((item) => item.taskId),
        ),
)

export const selectRecentTaskIdSetByLinkId = createSelector(
    [selectRecentAttachmentSignals, (_state: RootState, linkId: string) => linkId],
    (recentAttachmentSignals, linkId) =>
        new Set(
            recentAttachmentSignals
                .filter(
                    (item) =>
                        item.entityType === 'link' && item.entityId === linkId,
                )
                .map((item) => item.taskId),
        ),
)
//#endregion recent signals

//#region smart suggestion selectors
export const selectSuggestedNotesByTaskId = createSelector(
    [
        selectTaskById,
        (state: RootState) => state.notes.items,
        selectAttachedNoteIdsByTaskId,
        selectDismissedSuggestionKeySetByTaskId,
        selectRecentAttachmentSignalKeySetByTaskId,
    ],
    (
        task,
        notes,
        attachedNoteIds,
        dismissedSuggestionKeySet,
        recentAttachmentSignalKeySet,
    ): ISuggestedNoteResult[] => {
        if (!task) {
            return []
        }

        const attachedNoteIdSet = new Set(attachedNoteIds)

        const suggestedNotes = notes.flatMap((note) => {
            const suggestionScore = scoreNoteSuggestionForTask(task, note, {
                isAlreadyAttached: attachedNoteIdSet.has(note.id),
                isDismissed: dismissedSuggestionKeySet.has(
                    createEntityLookupKey('note', note.id),
                ),
                hasRecentAttachmentSignal: recentAttachmentSignalKeySet.has(
                    createEntityLookupKey('note', note.id),
                ),
            })

            if (!suggestionScore) {
                return []
            }

            return [
                {
                    entityType: 'note' as const,
                    entity: note,
                    score: suggestionScore.score,
                    reasons: suggestionScore.reasons,
                },
            ]
        })

        return applySuggestionQualityGate(suggestedNotes, {
            minScore: SMART_LINKING_MIN_SUGGESTION_SCORE,
        })
    },
)

export const selectSuggestedLinksByTaskId = createSelector(
    [
        selectTaskById,
        (state: RootState) => state.links.items,
        selectAttachedLinkIdsByTaskId,
        selectDismissedSuggestionKeySetByTaskId,
        selectRecentAttachmentSignalKeySetByTaskId,
    ],
    (
        task,
        links,
        attachedLinkIds,
        dismissedSuggestionKeySet,
        recentAttachmentSignalKeySet,
    ): ISuggestedLinkResult[] => {
        if (!task) {
            return []
        }

        const attachedLinkIdSet = new Set(attachedLinkIds)

        const suggestedLinks = links.flatMap((link) => {
            const suggestionScore = scoreLinkSuggestionForTask(task, link, {
                isAlreadyAttached: attachedLinkIdSet.has(link.id),
                isDismissed: dismissedSuggestionKeySet.has(
                    createEntityLookupKey('link', link.id),
                ),
                hasRecentAttachmentSignal: recentAttachmentSignalKeySet.has(
                    createEntityLookupKey('link', link.id),
                ),
            })

            if (!suggestionScore) {
                return []
            }

            return [
                {
                    entityType: 'link' as const,
                    entity: link,
                    score: suggestionScore.score,
                    reasons: suggestionScore.reasons,
                },
            ]
        })

        return applySuggestionQualityGate(suggestedLinks, {
            minScore: SMART_LINKING_MIN_SUGGESTION_SCORE,
        })
    },
)

export const selectSuggestedEntitiesByTaskId = createSelector(
    [selectSuggestedNotesByTaskId, selectSuggestedLinksByTaskId],
    (suggestedNotes, suggestedLinks): SuggestedTaskEntityResult[] =>
    applySuggestionQualityGate(
        [...suggestedNotes, ...suggestedLinks],
        {
            minScore: SMART_LINKING_MIN_SUGGESTION_SCORE,
        },
    )
)

export const selectSuggestedTasksByNoteId = createSelector(
    [
        selectNoteById,
        selectAllTasks,
        selectRelatedTaskIdsByNoteId,
        selectRecentTaskIdSetByNoteId,
    ],
    (
        note,
        tasks,
        relatedTaskIds,
        recentTaskIdSet,
    ): ISuggestedTaskResult[] => {
        if (!note) {
            return []
        }

        const relatedTaskIdSet = new Set(relatedTaskIds)

        const suggestedTasks = tasks.flatMap((task) => {
            const suggestionScore = scoreTaskSuggestionForNote(task, note, {
                isAlreadyAttached: relatedTaskIdSet.has(task.id),
                hasRecentAttachmentSignal: recentTaskIdSet.has(task.id),
            })

            if (!suggestionScore) {
                return []
            }

            return [
                {
                    entityType: 'task' as const,
                    entity: task,
                    score: suggestionScore.score,
                    reasons: suggestionScore.reasons,
                },
            ]
        })

        return applySuggestionQualityGate(suggestedTasks, {
            minScore: SMART_LINKING_MIN_SUGGESTION_SCORE,
        })
    },
)

export const selectSuggestedTasksByLinkId = createSelector(
    [
        selectLinkById,
        selectAllTasks,
        selectRelatedTaskIdsByLinkId,
        selectRecentTaskIdSetByLinkId,
    ],
    (
        link,
        tasks,
        relatedTaskIds,
        recentTaskIdSet,
    ): ISuggestedTaskResult[] => {
        if (!link) {
            return []
        }

        const relatedTaskIdSet = new Set(relatedTaskIds)

        const suggestedTasks = tasks.flatMap((task) => {
            const suggestionScore = scoreTaskSuggestionForLink(task, link, {
                isAlreadyAttached: relatedTaskIdSet.has(task.id),
                hasRecentAttachmentSignal: recentTaskIdSet.has(task.id),
            })

            if (!suggestionScore) {
                return []
            }

            return [
                {
                    entityType: 'task' as const,
                    entity: task,
                    score: suggestionScore.score,
                    reasons: suggestionScore.reasons,
                },
            ]
        })

        return applySuggestionQualityGate(suggestedTasks, {
            minScore: SMART_LINKING_MIN_SUGGESTION_SCORE,
        })
    },
)

export const selectSimilarTasksByTaskId = createSelector(
    [selectTaskById, selectAllTasks, selectTaskNoteRefs, selectTaskLinkRefs],
    (
        task,
        tasks,
        taskNoteRefs,
        taskLinkRefs,
    ): SimilarTaskResult[] => {
        if (!task) {
            return []
        }

        const baseNoteIds = taskNoteRefs
            .filter((item) => item.taskId === task.id)
            .map((item) => item.noteId)

        const baseLinkIds = taskLinkRefs
            .filter((item) => item.taskId === task.id)
            .map((item) => item.linkId)

        const baseLabelIds = task.labelIds ?? []

        const similarTasks = tasks.flatMap((candidateTask) => {
            const candidateNoteIds = taskNoteRefs
                .filter((item) => item.taskId === candidateTask.id)
                .map((item) => item.noteId)

            const candidateLinkIds = taskLinkRefs
                .filter((item) => item.taskId === candidateTask.id)
                .map((item) => item.linkId)

            const candidateLabelIds = candidateTask.labelIds ?? []

            const suggestionScore = scoreSimilarTaskForTask(task, candidateTask, {
                sharedNoteCount: getUniqueIntersectionCount(
                    baseNoteIds,
                    candidateNoteIds,
                ),
                sharedLinkCount: getUniqueIntersectionCount(
                    baseLinkIds,
                    candidateLinkIds,
                ),
                sharedLabelCount: getUniqueIntersectionCount(
                    baseLabelIds,
                    candidateLabelIds,
                ),
            })

            if (!suggestionScore) {
                return []
            }

            return [
                {
                    entityType: 'task' as const,
                    entity: candidateTask,
                    score: suggestionScore.score,
                    reasons: suggestionScore.reasons,
                },
            ]
        })

        return applySuggestionQualityGate(similarTasks, {
            minScore: SIMILAR_TASK_MIN_SUGGESTION_SCORE,
        })
    },
)
//#endregion smart suggestion selectors

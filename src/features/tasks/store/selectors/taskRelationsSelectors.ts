import { createSelector } from '@reduxjs/toolkit'

import { scoreLinkSuggestionForTask, scoreNoteSuggestionForTask } from '@/features/tasks/utils/smartLinkingScoring'

import type { RootState } from '@/app/store/store'
import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { SmartLinkedEntityType } from '@/features/tasks/types/taskRelationTypes'

//#region constants
const SMART_LINKING_MAX_SUGGESTIONS = 5
//#endregion constants

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

export type ISuggestedTaskEntityResult =
  | ISuggestedNoteResult
  | ISuggestedLinkResult
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

const sortSuggestedResultsByScore = <T extends { score: number }>(
  items: T[],
): T[] => [...items].sort((left, right) => right.score - left.score)

const toLimitedSuggestionResults = <T extends { score: number }>(
  items: T[],
): T[] =>
  sortSuggestedResultsByScore(items).slice(0, SMART_LINKING_MAX_SUGGESTIONS)
//#endregion helpers

//#region task selectors
export const selectTaskById = createSelector(
  [(state: RootState) => state.tasks.items, (_state: RootState, taskId: string) => taskId],
  (tasks, taskId) => tasks.find((task) => task.id === taskId) ?? null,
)
//#endregion task selectors

//#region relation selectors
export const selectTaskNoteRefsByTaskId = createSelector(
  [selectTaskNoteRefs, (_state: RootState, taskId: string) => taskId],
  (taskNoteRefs, taskId) => taskNoteRefs.filter((item) => item.taskId === taskId),
)

export const selectTaskLinkRefsByTaskId = createSelector(
  [selectTaskLinkRefs, (_state: RootState, taskId: string) => taskId],
  (taskLinkRefs, taskId) => taskLinkRefs.filter((item) => item.taskId === taskId),
)

export const selectAttachedNoteIdsByTaskId = createSelector(
  [selectTaskNoteRefsByTaskId],
  (taskNoteRefs) => taskNoteRefs.map((item) => item.noteId),
)

export const selectAttachedLinkIdsByTaskId = createSelector(
  [selectTaskLinkRefsByTaskId],
  (taskLinkRefs) => taskLinkRefs.map((item) => item.linkId),
)

export const selectAttachedNotesByTaskId = createSelector(
  [(state: RootState) => state.notes.items, selectAttachedNoteIdsByTaskId],
  (notes, attachedNoteIds) => notes.filter((note) => attachedNoteIds.includes(note.id)),
)

export const selectAttachedLinksByTaskId = createSelector(
  [(state: RootState) => state.links.items, selectAttachedLinkIdsByTaskId],
  (links, attachedLinkIds) => links.filter((link) => attachedLinkIds.includes(link.id)),
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

    return toLimitedSuggestionResults(suggestedNotes)
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

    return toLimitedSuggestionResults(suggestedLinks)
  },
)

export const selectSuggestedEntitiesByTaskId = createSelector(
  [selectSuggestedNotesByTaskId, selectSuggestedLinksByTaskId],
  (suggestedNotes, suggestedLinks): ISuggestedTaskEntityResult[] =>
    toLimitedSuggestionResults([...suggestedNotes, ...suggestedLinks]),
)
//#endregion smart suggestion selectors

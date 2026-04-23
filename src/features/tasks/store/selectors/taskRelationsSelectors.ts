import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store/store'
import type { SmartLinkedEntityType } from '@/features/tasks/types/taskRelationTypes'

//#region base selectors
export const selectTaskRelationsState = (state: RootState) => state.taskRelations
export const selectTaskNoteRefs = (state: RootState) => state.taskRelations.taskNoteRefs
export const selectTaskLinkRefs = (state: RootState) => state.taskRelations.taskLinkRefs
export const selectDismissedSuggestions = (state: RootState) =>
  state.taskRelations.dismissedSuggestions
export const selectRecentAttachmentSignals = (state: RootState) =>
  state.taskRelations.recentAttachmentSignals
//#endregion base selectors

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
  [
    (state: RootState) => state.notes.items,
    selectAttachedNoteIdsByTaskId,
  ],
  (notes, attachedNoteIds) =>
    notes.filter((note) => attachedNoteIds.includes(note.id)),
)

export const selectAttachedLinksByTaskId = createSelector(
  [
    (state: RootState) => state.links.items,
    selectAttachedLinkIdsByTaskId,
  ],
  (links, attachedLinkIds) =>
    links.filter((link) => attachedLinkIds.includes(link.id)),
)
//#endregion relation selectors

//#region dismissed selectors
export const selectDismissedSuggestionsByTaskId = createSelector(
  [selectDismissedSuggestions, (_state: RootState, taskId: string) => taskId],
  (dismissedSuggestions, taskId) =>
    dismissedSuggestions.filter((item) => item.taskId === taskId),
)

export const selectIsSuggestionDismissed = createSelector(
  [
    selectDismissedSuggestions,
    (_state: RootState, taskId: string) => taskId,
    (_state: RootState, _taskId: string, entityType: SmartLinkedEntityType) =>
      entityType,
    (_state: RootState, _taskId: string, _entityType: SmartLinkedEntityType, entityId: string) =>
      entityId,
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
//#endregion recent signals

export type SmartLinkedEntityType = 'note' | 'link'

export interface ITaskNoteRef {
  id: string
  taskId: string
  noteId: string
  createdAt: string
}

export interface ITaskLinkRef {
  id: string
  taskId: string
  linkId: string
  createdAt: string
}

export interface IDismissedSuggestion {
  id: string
  taskId: string
  entityType: SmartLinkedEntityType
  entityId: string
  dismissedAt: string
}

export interface IRecentAttachmentSignal {
  id: string
  taskId: string
  entityType: SmartLinkedEntityType
  entityId: string
  attachedAt: string
}

export interface ITaskRelationsState {
  taskNoteRefs: ITaskNoteRef[]
  taskLinkRefs: ITaskLinkRef[]
  dismissedSuggestions: IDismissedSuggestion[]
  recentAttachmentSignals: IRecentAttachmentSignal[]
}

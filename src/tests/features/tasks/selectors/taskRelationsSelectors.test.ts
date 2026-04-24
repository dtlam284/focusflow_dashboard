import { describe, expect, it } from 'vitest'

import { 
  selectSuggestedEntitiesByTaskId, 
  selectSuggestedLinksByTaskId, 
  selectSuggestedNotesByTaskId 
} from '@/features/tasks/store/selectors/taskRelationsSelectors'

import type { RootState } from '@/app/store/store'
import type { ILink } from '@/features/links/types/linkTypes'
import type { ILinksState } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
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
    _persist: {
      version: -1,
      rehydrated: true,
    },
  }) as RootState
//#endregion helpers

//#region tests
describe('taskRelationsSelectors', () => {
  it('returns sorted suggested notes and excludes attached or dismissed notes', () => {
    const task = createTask()

    const strongNote = createNote({
      id: 'note-strong',
      title: 'Accessibility checklist',
      content: 'Keyboard navigation review for dashboard filters',
    })

    const mediumNote = createNote({
      id: 'note-medium',
      title: 'Dashboard checklist',
      content: 'Review docs',
      category: 'learning',
    })

    const attachedNote = createNote({
      id: 'note-attached',
      title: 'Frontend accessibility guide',
      content: 'Keyboard navigation review',
    })

    const dismissedNote = createNote({
      id: 'note-dismissed',
      title: 'Accessibility review notes',
      content: 'Dashboard keyboard filters',
    })

    const weakNote = createNote({
      id: 'note-weak',
      title: 'Personal reminder',
      content: 'Buy milk and clean desk',
      category: 'personal',
    })

    const state = createRootState({
      tasks: createTasksState([task]),
      notes: createNotesState([
        strongNote,
        mediumNote,
        attachedNote,
        dismissedNote,
        weakNote,
      ]),
      links: createLinksState([]),
      taskRelations: createTaskRelationsState({
        taskNoteRefs: [
          {
            id: 'task-note:task-1:note-attached',
            taskId: 'task-1',
            noteId: 'note-attached',
            createdAt: '2026-04-24T00:00:00.000Z',
          },
        ],
        dismissedSuggestions: [
          {
            id: 'dismissed:task-1:note:note-dismissed',
            taskId: 'task-1',
            entityType: 'note',
            entityId: 'note-dismissed',
            dismissedAt: '2026-04-24T00:00:00.000Z',
          },
        ],
      }),
    })

    const result = selectSuggestedNotesByTaskId(state, 'task-1')

    expect(result).toHaveLength(2)
    expect(result.map((item) => item.entity.id)).toEqual([
      'note-strong',
      'note-medium',
    ])
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0)
    expect(result[0]?.reasons.length).toBeGreaterThan(0)
  })

  it('returns sorted suggested links and excludes attached or dismissed links', () => {
    const task = createTask()

    const strongLink = createLink({
      id: 'link-strong',
      title: 'Frontend accessibility keyboard navigation',
      category: 'design',
    })

    const mediumLink = createLink({
      id: 'link-medium',
      title: 'Dashboard filters guide',
      category: 'learning',
    })

    const attachedLink = createLink({
      id: 'link-attached',
      title: 'Accessibility review patterns',
      category: 'design',
    })

    const dismissedLink = createLink({
      id: 'link-dismissed',
      title: 'Keyboard navigation checklist',
      category: 'design',
    })

    const weakLink = createLink({
      id: 'link-weak',
      title: 'Cooking recipes',
      url: 'https://example.com/cooking-recipes',
      category: 'other',
    })

    const state = createRootState({
      tasks: createTasksState([task]),
      notes: createNotesState([]),
      links: createLinksState([
        strongLink,
        mediumLink,
        attachedLink,
        dismissedLink,
        weakLink,
      ]),
      taskRelations: createTaskRelationsState({
        taskLinkRefs: [
          {
            id: 'task-link:task-1:link-attached',
            taskId: 'task-1',
            linkId: 'link-attached',
            createdAt: '2026-04-24T00:00:00.000Z',
          },
        ],
        dismissedSuggestions: [
          {
            id: 'dismissed:task-1:link:link-dismissed',
            taskId: 'task-1',
            entityType: 'link',
            entityId: 'link-dismissed',
            dismissedAt: '2026-04-24T00:00:00.000Z',
          },
        ],
      }),
    })

    const result = selectSuggestedLinksByTaskId(state, 'task-1')

    expect(result).toHaveLength(2)
    expect(result.map((item) => item.entity.id)).toEqual([
      'link-strong',
      'link-medium',
    ])
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0)
    expect(result[0]?.reasons.length).toBeGreaterThan(0)
  })

  it('merges note and link suggestions into one sorted entity list', () => {
    const task = createTask()

    const strongNote = createNote({
      id: 'note-strong',
      title: 'Accessibility checklist',
      content: 'Keyboard navigation review for dashboard filters',
    })

    const strongLink = createLink({
      id: 'link-strong',
      title: 'Frontend accessibility keyboard navigation',
      category: 'design',
    })

    const mediumNote = createNote({
      id: 'note-medium',
      title: 'Dashboard checklist',
      content: 'Review docs',
    })

    const state = createRootState({
      tasks: createTasksState([task]),
      notes: createNotesState([strongNote, mediumNote]),
      links: createLinksState([strongLink]),
      taskRelations: createTaskRelationsState(),
    })

    const result = selectSuggestedEntitiesByTaskId(state, 'task-1')

    expect(result).toHaveLength(3)
    expect(result[0]?.score).toBeGreaterThanOrEqual(result[1]?.score ?? 0)
    expect(result[1]?.score).toBeGreaterThanOrEqual(result[2]?.score ?? 0)
    expect(result.map((item) => item.entityType)).toEqual([
      'link',
      'note',
      'note',
    ])
  })

  it('returns empty arrays when the task does not exist', () => {
    const state = createRootState({
      tasks: createTasksState([]),
      notes: createNotesState([createNote()]),
      links: createLinksState([createLink()]),
      taskRelations: createTaskRelationsState(),
    })

    expect(selectSuggestedNotesByTaskId(state, 'missing-task')).toEqual([])
    expect(selectSuggestedLinksByTaskId(state, 'missing-task')).toEqual([])
    expect(selectSuggestedEntitiesByTaskId(state, 'missing-task')).toEqual([])
  })

  it('keeps dismiss behavior task-scoped for the same entity', () => {
    const taskA = createTask({ id: 'task-a', title: 'Accessibility review' })
    const taskB = createTask({ id: 'task-b', title: 'Accessibility review' })

    const sharedNote = createNote({
      id: 'note-shared',
      title: 'Accessibility checklist',
      content: 'Keyboard navigation review',
    })

    const state = createRootState({
      tasks: createTasksState([taskA, taskB]),
      notes: createNotesState([sharedNote]),
      links: createLinksState([]),
      taskRelations: createTaskRelationsState({
        dismissedSuggestions: [
          {
            id: 'dismissed:task-a:note:note-shared',
            taskId: 'task-a',
            entityType: 'note',
            entityId: 'note-shared',
            dismissedAt: '2026-04-24T00:00:00.000Z',
          },
        ],
      }),
    })

    expect(selectSuggestedNotesByTaskId(state, 'task-a')).toEqual([])
    expect(selectSuggestedNotesByTaskId(state, 'task-b')).toHaveLength(1)
    expect(selectSuggestedNotesByTaskId(state, 'task-b')[0]?.entity.id).toBe(
      'note-shared',
    )
  })

  it('excludes a dismissed suggestion without removing the source entity from state', () => {
    const task = createTask()

    const dismissedLink = createLink({
      id: 'link-dismissed-only',
      title: 'Accessibility review patterns',
      category: 'design',
    })

    const state = createRootState({
      tasks: createTasksState([task]),
      notes: createNotesState([]),
      links: createLinksState([dismissedLink]),
      taskRelations: createTaskRelationsState({
        dismissedSuggestions: [
          {
            id: 'dismissed:task-1:link:link-dismissed-only',
            taskId: 'task-1',
            entityType: 'link',
            entityId: 'link-dismissed-only',
            dismissedAt: '2026-04-24T00:00:00.000Z',
          },
        ],
      }),
    })

    expect(state.links.items).toHaveLength(1)
    expect(state.links.items[0]?.id).toBe('link-dismissed-only')
    expect(selectSuggestedLinksByTaskId(state, 'task-1')).toEqual([])
  })
})
//#endregion tests

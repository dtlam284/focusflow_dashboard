import { describe, expect, it } from 'vitest'

import { selectCompletedTaskCount, selectFilteredTasks, selectPendingTaskCount, } from '@/features/tasks/store/selectors/taskSelectors'
import tasksReducer, { addTask, bulkDeleteTasks, bulkUpdateTaskStatus, deleteTask, resetTaskFilters, setTaskFilters, toggleTaskStatus, updateTask } from '@/features/tasks/store/slices/taskSlice'

import type { RootState } from '@/app/store/store'
import type { ITask, ITasksState } from '@/features/tasks/types/taskTypes'

//#region helpers
const createTask = (overrides: Partial<ITask> = {}): ITask => {
  const baseTask: ITask = {
    id: 'task-1',
    title: 'Task title',
    description: 'Task description',
    status: 'todo',
    order: 0,
    priority: 'medium',
    labelIds: [],
    createdAt: '2026-04-21T00:00:00.000Z',
    updatedAt: '2026-04-21T00:00:00.000Z',
  }

  return {
    ...baseTask,
    ...overrides,
    order: overrides.order ?? baseTask.order,
    labelIds: overrides.labelIds ?? baseTask.labelIds,
  }
}

const createTasksState = (overrides: Partial<ITasksState> = {}): ITasksState => ({
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
    labelId: 'all',
  },
  ...overrides,
})

const createRootState = (tasks: ITasksState): RootState =>
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
    board: {
      showCompleted: true,
      sortMode: 'newest',
      groupMode:'status'
    },
    taskRelations: {
      taskNoteRefs: [],
      taskLinkRefs: [],
      dismissedSuggestions: [],
      recentAttachmentSignals: [],
    },
    notes: {
      items: [],
      filters: {
        keyword: '',
      },
    },
    noteDetail: {
      selectedNoteId: null,
      isOpen: false,
    },
    linkDetail: {
      selectedLinkId: null,
      isOpen: false,
    },
    links: {
      items: [],
      filters: {
        keyword: '',
        category: 'all',
      },
    },
    smartLinkingPreferences: {
        enabled: true,
        maxSuggestions: 5,
        showReasons: true,
        hideDismissed: true,
    },
    _persist: {
      version: -1,
      rehydrated: true,
    },
  }) as RootState
//#endregion helpers

//#region tests
describe('tasksSlice', () => {
  it('adds a task', () => {
    const nextState = tasksReducer(
      createTasksState(),
      addTask(
        createTask({
          id: 'task-1',
          title: 'Learn Redux Toolkit',
          description: 'Read docs and build a slice',
          status: 'todo',
          order: 0,
          priority: 'high',
          labelIds: ['label-feature'],
          createdAt: '2026-04-06T00:00:00.000Z',
          updatedAt: '2026-04-06T00:00:00.000Z',
        }),
      ),
    )

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0]?.title).toBe('Learn Redux Toolkit')
    expect(nextState.items[0]?.priority).toBe('high')
    expect(nextState.items[0]?.order).toBe(0)
    expect(nextState.items[0]?.labelIds).toEqual(['label-feature'])
  })

  it('updates a task', () => {
    const initialState = createTasksState({
      items: [createTask()],
    })

    const nextState = tasksReducer(
      initialState,
      updateTask({
        id: 'task-1',
        changes: {
          title: 'Learn Redux Toolkit deeply',
          priority: 'medium',
          labelIds: ['label-bug', 'label-feature'],
        },
      }),
    )

    expect(nextState.items[0]?.title).toBe('Learn Redux Toolkit deeply')
    expect(nextState.items[0]?.priority).toBe('medium')
    expect(nextState.items[0]?.labelIds).toEqual(['label-bug', 'label-feature'])
  })

  it('deletes a task', () => {
    const initialState = createTasksState({
      items: [createTask()],
    })

    const nextState = tasksReducer(initialState, deleteTask('task-1'))

    expect(nextState.items).toHaveLength(0)
  })

  it('toggles task status', () => {
    const initialState = createTasksState({
      items: [createTask({ status: 'todo' })],
    })

    const nextState = tasksReducer(initialState, toggleTaskStatus('task-1'))

    expect(nextState.items[0]?.status).toBe('done')
  })

  it('sets task filters', () => {
    const nextState = tasksReducer(
      createTasksState(),
      setTaskFilters({
        status: 'done',
        keyword: 'redux',
        labelId: 'label-bug',
      }),
    )

    expect(nextState.filters.status).toBe('done')
    expect(nextState.filters.keyword).toBe('redux')
    expect(nextState.filters.priority).toBe('all')
    expect(nextState.filters.labelId).toBe('label-bug')
  })

  it('resets task filters', () => {
    const initialState = createTasksState({
      filters: {
        status: 'done',
        priority: 'high',
        keyword: 'redux',
        labelId: 'label-bug',
      },
    })

    const nextState = tasksReducer(initialState, resetTaskFilters())

    expect(nextState.filters).toEqual({
      status: 'all',
      priority: 'all',
      keyword: '',
      labelId: 'all',
    })
  })

  it('returns filtered tasks', () => {
    const tasksState = createTasksState({
      items: [
        createTask({
          id: 'task-1',
          title: 'Learn Redux Toolkit',
          status: 'todo',
          order: 0,
          priority: 'high',
          labelIds: ['label-feature'],
        }),
        createTask({
          id: 'task-2',
          title: 'Write tests',
          status: 'done',
          order: 1,
          priority: 'medium',
          labelIds: ['label-bug'],
        }),
      ],
      filters: {
        status: 'done',
        priority: 'all',
        keyword: 'write',
        labelId: 'label-bug',
      },
    })

    const state = createRootState(tasksState)
    const result = selectFilteredTasks(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('task-2')
  })

  it('returns completed and pending counts', () => {
    const tasksState = createTasksState({
      items: [
        createTask({ id: 'task-1', status: 'done', order: 0 }),
        createTask({ id: 'task-2', status: 'todo', order: 1 }),
        createTask({ id: 'task-3', status: 'done', order: 2 }),
      ],
    })

    const state = createRootState(tasksState)

    expect(selectCompletedTaskCount(state)).toBe(2)
    expect(selectPendingTaskCount(state)).toBe(1)
  })

  it('bulk deletes tasks and reindexes orders per column', () => {
    const initialState = createTasksState({
      items: [
        createTask({ id: 'task-1', status: 'todo', order: 0 }),
        createTask({ id: 'task-2', status: 'todo', order: 1 }),
        createTask({ id: 'task-3', status: 'done', order: 0 }),
        createTask({ id: 'task-4', status: 'todo', order: 2 }),
      ],
    })

    const nextState = tasksReducer(
      initialState,
      bulkDeleteTasks(['task-2', 'task-3']),
    )

    expect(nextState.items.map((task) => task.id)).toEqual(['task-1', 'task-4'])
    expect(nextState.items.find((task) => task.id === 'task-1')?.order).toBe(0)
    expect(nextState.items.find((task) => task.id === 'task-4')?.order).toBe(1)
  })

  it('bulk updates status and reindexes destination columns', () => {
    const initialState = createTasksState({
      items: [
        createTask({ id: 'task-1', status: 'todo', order: 0 }),
        createTask({ id: 'task-2', status: 'todo', order: 1 }),
        createTask({ id: 'task-3', status: 'review', order: 0 }),
        createTask({ id: 'task-4', status: 'done', order: 0 }),
      ],
    })

    const nextState = tasksReducer(
      initialState,
      bulkUpdateTaskStatus({
        taskIds: ['task-1', 'task-3'],
        status: 'done',
      }),
    )

    const doneTasks = nextState.items
      .filter((task) => task.status === 'done')
      .sort((left, right) => left.order - right.order)

    const todoTasks = nextState.items
      .filter((task) => task.status === 'todo')
      .sort((left, right) => left.order - right.order)

    expect(doneTasks.map((task) => task.id)).toEqual([
      'task-4',
      'task-1',
      'task-3',
    ])
    expect(todoTasks.map((task) => task.id)).toEqual(['task-2'])
    expect(todoTasks[0]?.order).toBe(0)
    expect(doneTasks[0]?.order).toBe(0)
    expect(doneTasks[1]?.order).toBe(1)
    expect(doneTasks[2]?.order).toBe(2)
  })
})
//#endregion tests

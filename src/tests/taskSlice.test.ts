import { describe, expect, it } from 'vitest'

import { selectCompletedTaskCount, selectFilteredTasks, selectPendingTaskCount, } from '@/features/tasks/store/selectors/taskSelectors'
import tasksReducer, { addTask, deleteTask, resetTaskFilters, setTaskFilters, updateTask, toggleTaskStatus } from '@/features/tasks/store/slices/taskSlice'

import type { RootState } from '@/app/store/store'
import type { ITask, ITasksState } from '@/features/tasks/types/taskTypes'


const createTask = (overrides: Partial<ITask> = {}): ITask => ({
  id: 'task-1',
  title: 'Learn Redux Toolkit',
  description: 'Build a typed slice',
  status: 'todo',
  priority: 'high',
  createdAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-04-12T00:00:00.000Z',
  ...overrides,
})

const createTasksState = (overrides: Partial<ITasksState> = {}): ITasksState => ({
  items: [],
  filters: {
    status: 'all',
    priority: 'all',
    keyword: '',
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
    notes: {
      items: [],
      filters: {
        keyword: '',
        color: 'all',
        pinned: 'all',
      },
    },
    links: {
      items: [],
      filters: {
        keyword: '',
        category: 'all',
      },
    },
    _persist: {
      version: -1,
      rehydrated: true,
    },
  }) as RootState

describe('tasksSlice', () => {
  it('adds a task', () => {
    const initialState = createTasksState()

    const nextState = tasksReducer(initialState, addTask(createTask()))

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0]?.title).toBe('Learn Redux Toolkit')
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
        },
      }),
    )

    expect(nextState.items[0]?.title).toBe('Learn Redux Toolkit deeply')
    expect(nextState.items[0]?.priority).toBe('medium')
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
    const initialState = createTasksState()

    const nextState = tasksReducer(
      initialState,
      setTaskFilters({
        status: 'done',
        keyword: 'redux',
      }),
    )

    expect(nextState.filters.status).toBe('done')
    expect(nextState.filters.keyword).toBe('redux')
    expect(nextState.filters.priority).toBe('all')
  })

  it('resets task filters', () => {
    const initialState = createTasksState({
      filters: {
        status: 'done',
        priority: 'high',
        keyword: 'redux',
      },
    })

    const nextState = tasksReducer(initialState, resetTaskFilters())

    expect(nextState.filters).toEqual({
      status: 'all',
      priority: 'all',
      keyword: '',
    })
  })
})

describe('taskSelectors', () => {
  it('returns filtered tasks', () => {
    const tasksState = createTasksState({
      items: [
        createTask({
          id: 'task-1',
          title: 'Learn Redux Toolkit',
          status: 'todo',
          priority: 'high',
        }),
        createTask({
          id: 'task-2',
          title: 'Write tests',
          status: 'done',
          priority: 'medium',
        }),
      ],
      filters: {
        status: 'done',
        priority: 'all',
        keyword: 'write',
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
        createTask({ id: 'task-1', status: 'done' }),
        createTask({ id: 'task-2', status: 'todo' }),
        createTask({ id: 'task-3', status: 'done' }),
      ],
    })

    const state = createRootState(tasksState)

    expect(selectCompletedTaskCount(state)).toBe(2)
    expect(selectPendingTaskCount(state)).toBe(1)
  })
})
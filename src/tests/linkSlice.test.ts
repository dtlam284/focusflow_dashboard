import { describe, expect, it } from 'vitest'

import { selectFilteredLinks } from '@/features/links/store/selectors/linkSelectors'
import linkReducer, { addLink, deleteLink, resetLinkFilters, setLinkFilters, updateLink, } from '@/features/links/store/slices/linkSlice'

import type { RootState } from '@/app/store/store'
import type { ILink, ILinksState } from '@/features/links/types/linkTypes'

const createLink = (overrides: Partial<ILink> = {}): ILink => ({
  id: 'link-1',
  title: 'Redux Toolkit docs',
  url: 'https://redux-toolkit.js.org',
  category: 'development',
  description: 'Official docs',
  createdAt: '2026-04-12T00:00:00.000Z',
  updatedAt: '2026-04-12T00:00:00.000Z',
  ...overrides,
})

const createLinksState = (overrides: Partial<ILinksState> = {}): ILinksState => ({
  items: [],
  filters: {
    keyword: '',
    category: 'all',
  },
  ...overrides,
})

const createRootState = (links: ILinksState): RootState =>
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
    tasks: {
      items: [],
      filters: {
        status: 'all',
        priority: 'all',
        keyword: '',
      },
    },
    notes: {
      items: [],
      filters: {
        keyword: '',
        color: 'all',
        pinned: 'all',
      },
    },
    links,
    _persist: {
      version: -1,
      rehydrated: true,
    },
  }) as RootState

describe('linkSlice', () => {
  it('adds a link', () => {
    const initialState = createLinksState()

    const nextState = linkReducer(initialState, addLink(createLink()))

    expect(nextState.items).toHaveLength(1)
    expect(nextState.items[0]?.title).toBe('Redux Toolkit docs')
  })

  it('updates a link', () => {
    const initialState = createLinksState({
      items: [createLink()],
    })

    const nextState = linkReducer(
      initialState,
      updateLink({
        id: 'link-1',
        changes: {
          title: 'Updated Redux Toolkit docs',
          category: 'learning',
        },
      }),
    )

    expect(nextState.items[0]?.title).toBe('Updated Redux Toolkit docs')
    expect(nextState.items[0]?.category).toBe('learning')
  })

  it('deletes a link', () => {
    const initialState = createLinksState({
      items: [createLink()],
    })

    const nextState = linkReducer(initialState, deleteLink('link-1'))

    expect(nextState.items).toHaveLength(0)
  })

  it('sets link filters', () => {
    const initialState = createLinksState()

    const nextState = linkReducer(
      initialState,
      setLinkFilters({
        keyword: 'redux',
        category: 'development',
      }),
    )

    expect(nextState.filters.keyword).toBe('redux')
    expect(nextState.filters.category).toBe('development')
  })

  it('resets link filters', () => {
    const initialState = createLinksState({
      filters: {
        keyword: 'redux',
        category: 'development',
      },
    })

    const nextState = linkReducer(initialState, resetLinkFilters())

    expect(nextState.filters).toEqual({
      keyword: '',
      category: 'all',
    })
  })
})

describe('linkSelectors', () => {
  it('returns filtered links', () => {
    const linksState = createLinksState({
      items: [
        createLink({
          id: 'link-1',
          title: 'Redux Toolkit docs',
          category: 'development',
        }),
        createLink({
          id: 'link-2',
          title: 'Figma design system',
          category: 'design',
          url: 'https://figma.com/file/demo',
        }),
      ],
      filters: {
        keyword: 'redux',
        category: 'development',
      },
    })

    const state = createRootState(linksState)
    const result = selectFilteredLinks(state)

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('link-1')
  })
})
import { describe, expect, it } from 'vitest'
import boardReducer, { hydrateBoardPreferences, resetBoardPreferences, setGroupMode, setShowCompleted, setSortMode, type IBoardState, } from '@/features/tasks/store/slices/boardSlice'

//#region helpers
const createBoardState = (
  overrides: Partial<IBoardState> = {},
): IBoardState => ({
  showCompleted: true,
  sortMode: 'newest',
  groupMode: 'status',
  ...overrides,
})
//#endregion helpers

//#region tests
describe('boardSlice', () => {
  it('returns the initial state', () => {
    const state = boardReducer(undefined, { type: 'unknown' })

    expect(state).toEqual({
      showCompleted: true,
      sortMode: 'newest',
      groupMode: 'status',
    })
  })

  it('hydrates saved board preferences', () => {
    const nextState = boardReducer(
      createBoardState(),
      hydrateBoardPreferences({
        showCompleted: false,
        sortMode: 'oldest',
        groupMode: 'label',
      }),
    )

    expect(nextState).toEqual({
      showCompleted: false,
      sortMode: 'oldest',
      groupMode: 'label',
    })
  })

  it('updates showCompleted', () => {
    const nextState = boardReducer(
      createBoardState(),
      setShowCompleted(false),
    )

    expect(nextState.showCompleted).toBe(false)
  })

  it('updates sortMode', () => {
    const nextState = boardReducer(
      createBoardState(),
      setSortMode('oldest'),
    )

    expect(nextState.sortMode).toBe('oldest')
  })

  it('updates groupMode', () => {
    const nextState = boardReducer(
      createBoardState(),
      setGroupMode('label'),
    )

    expect(nextState.groupMode).toBe('label')
  })

  it('resets board preferences', () => {
    const nextState = boardReducer(
      createBoardState({
        showCompleted: false,
        sortMode: 'oldest',
        groupMode: 'label',
      }),
      resetBoardPreferences(),
    )

    expect(nextState).toEqual({
      showCompleted: true,
      sortMode: 'newest',
      groupMode: 'status',
    })
  })
})
//#endregion tests

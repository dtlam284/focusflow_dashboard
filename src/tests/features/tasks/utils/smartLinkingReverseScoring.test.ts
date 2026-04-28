import { describe, expect, it } from 'vitest'
import { scoreTaskSuggestionForLink, scoreTaskSuggestionForNote } from '@/features/tasks/utils/smartLinkingScoring'
import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ITask } from '@/features/tasks/types/taskTypes'

//#region fixtures
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
//#endregion fixtures

//#region tests
describe('smartLinkingReverseScoring', () => {
    describe('scoreTaskSuggestionForNote', () => {
        it('returns null when the task is already related to the note', () => {
            const score = scoreTaskSuggestionForNote(createTask(), createNote(), {
                isAlreadyAttached: true,
            })

            expect(score).toBeNull()
        })

        it('scores a task suggestion for a note with readable reasons', () => {
            const score = scoreTaskSuggestionForNote(createTask(), createNote())

            expect(score).not.toBeNull()
            expect(score?.entityType).toBe('task')
            expect(score?.entityId).toBe('task-1')
            expect(score?.score).toBe(19)
            expect(score?.reasons).toContain(
                'Matched task title: accessibility, review',
            )
            expect(score?.reasons).toContain(
                'Matched task details: keyboard, navigation',
            )
        })

        it('adds a recent attachment explanation when present', () => {
            const score = scoreTaskSuggestionForNote(createTask(), createNote(), {
                hasRecentAttachmentSignal: true,
            })

            expect(score).not.toBeNull()
            expect(score?.score).toBe(21)
            expect(score?.reasons).toContain(
                'Recently attached in a similar task context',
            )
        })
    })

    describe('scoreTaskSuggestionForLink', () => {
        it('returns null when the task is already related to the link', () => {
            const score = scoreTaskSuggestionForLink(createTask(), createLink(), {
                isAlreadyAttached: true,
            })

            expect(score).toBeNull()
        })

        it('scores a task suggestion for a link with readable reasons', () => {
            const score = scoreTaskSuggestionForLink(createTask(), createLink())

            expect(score).not.toBeNull()
            expect(score?.entityType).toBe('task')
            expect(score?.entityId).toBe('task-1')
            expect(score?.score).toBe(6)
            expect(score?.reasons).toContain(
                'Matched task details: keyboard, navigation',
            )
        })

        it('returns null for a weak or irrelevant reverse match', () => {
            const weakLink = createLink({
                title: 'Cooking recipes',
                category: 'other',
            })

            const score = scoreTaskSuggestionForLink(createTask(), weakLink)

            expect(score).toBeNull()
        })
    })
})
//#endregion tests

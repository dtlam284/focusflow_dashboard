import { describe, expect, it } from 'vitest'
import { scoreLinkSuggestionForTask, scoreNoteSuggestionForTask } from '@/features/tasks/utils/smartLinkingScoring'
import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ITask } from '@/features/tasks/types/taskTypes'

//#region fixtures
const createTask = (): ITask => ({
    id: 'task-1',
    title: 'Frontend accessibility review',
    description: 'Review dashboard filters and keyboard navigation',
    status: 'todo',
    priority: 'high',
    order: 1,
    labelIds: ['frontend'],
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
})

const createNote = (): INote => ({
    id: 'note-1',
    title: 'Accessibility checklist',
    content: 'Keyboard navigation review for dashboard filters',
    color: 'blue',
    category: 'learning',
    isPinned: false,
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
})

const createLink = (): ILink => ({
    id: 'link-1',
    title: 'Keyboard navigation patterns',
    url: 'https://example.com/keyboard-navigation-patterns',
    category: 'design',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-01T08:00:00.000Z',
})
//#endregion fixtures

//#region tests
describe('smartLinkingScoring', () => {
    describe('scoreNoteSuggestionForTask', () => {
        it('returns null when the note is already attached', () => {
            const score = scoreNoteSuggestionForTask(createTask(), createNote(), {
                isAlreadyAttached: true,
            })

            expect(score).toBeNull()
        })

        it('returns null when the note was dismissed', () => {
            const score = scoreNoteSuggestionForTask(createTask(), createNote(), {
                isDismissed: true,
            })

            expect(score).toBeNull()
        })

        it('scores a note using readable explanation reasons', () => {
            const score = scoreNoteSuggestionForTask(createTask(), createNote())

            expect(score).not.toBeNull()
            expect(score?.entityType).toBe('note')
            expect(score?.entityId).toBe('note-1')
            expect(score?.score).toBe(14)
            expect(score?.reasons).toContain(
                'Matched keywords in title: accessibility',
            )
            expect(score?.reasons).toContain(
                'Matched related content: review, dashboard',
            )
        })

        it('adds a recent attachment explanation when present', () => {
            const score = scoreNoteSuggestionForTask(createTask(), createNote(), {
                hasRecentAttachmentSignal: true,
            })

            expect(score).not.toBeNull()
            expect(score?.score).toBe(16)
            expect(score?.reasons).toContain(
                'Recently attached in a similar task context',
            )
        })

        it('returns null for a weak or irrelevant note match', () => {
            const weakNote: INote = {
                ...createNote(),
                id: 'note-2',
                title: 'Personal reminder',
                content: 'Buy milk and clean desk',
                category: 'personal',
            }

            const score = scoreNoteSuggestionForTask(createTask(), weakNote)

            expect(score).toBeNull()
        })
    })

    describe('scoreLinkSuggestionForTask', () => {
        it('returns null when the link is already attached', () => {
            const score = scoreLinkSuggestionForTask(createTask(), createLink(), {
                isAlreadyAttached: true,
            })

            expect(score).toBeNull()
        })

        it('returns null when the link was dismissed', () => {
            const score = scoreLinkSuggestionForTask(createTask(), createLink(), {
                isDismissed: true,
            })

            expect(score).toBeNull()
        })

        it('scores a link using readable explanation reasons', () => {
            const score = scoreLinkSuggestionForTask(createTask(), createLink())

            expect(score).not.toBeNull()
            expect(score?.entityType).toBe('link')
            expect(score?.entityId).toBe('link-1')
            expect(score?.score).toBe(10)
            expect(score?.reasons).toContain(
                'Matched keywords in title: keyboard, navigation',
            )
            expect(score?.reasons).not.toContain(
                'Matched category: design',
            )
        })

        it('adds a recent attachment explanation when present', () => {
            const score = scoreLinkSuggestionForTask(createTask(), createLink(), {
                hasRecentAttachmentSignal: true,
            })

            expect(score).not.toBeNull()
            expect(score?.score).toBe(12)
            expect(score?.reasons).toContain(
                'Recently attached in a similar task context',
            )
        })

        it('returns null for a weak or irrelevant link match', () => {
            const weakLink: ILink = {
                ...createLink(),
                id: 'link-2',
                title: 'Cooking recipes',
                url: 'https://example.com/cooking-recipes',
                category: 'other',
            }

            const score = scoreLinkSuggestionForTask(createTask(), weakLink)

            expect(score).toBeNull()
        })
    })
})
//#endregion tests

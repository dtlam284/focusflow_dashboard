import { describe, expect, it } from 'vitest'
import { scoreSimilarTaskForTask } from '@/features/tasks/utils/smartLinkingScoring'
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
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
    ...overrides,
})
//#endregion fixtures

//#region tests
describe('similarTaskScoring', () => {
    it('returns null for the same task', () => {
        const task = createTask()

        const score = scoreSimilarTaskForTask(task, task)

        expect(score).toBeNull()
    })

    it('scores a strong similar task using shared resources, labels, and keywords', () => {
        const baseTask = createTask()

        const candidateTask = createTask({
            id: 'task-2',
            title: 'Accessibility dashboard planning',
            description: 'Keyboard navigation improvements',
            labelIds: ['frontend'],
        })

        const score = scoreSimilarTaskForTask(baseTask, candidateTask, {
            sharedNoteCount: 1,
            sharedLinkCount: 1,
            sharedLabelCount: 1,
        })

        expect(score).not.toBeNull()
        expect(score?.entityType).toBe('task')
        expect(score?.entityId).toBe('task-2')
        expect(score?.score).toBe(21)
        expect(score?.reasons).toContain('Shares 2 linked resources')
        expect(score?.reasons).toContain(
            'Matched keywords: accessibility, dashboard',
        )
    })

    it('filters out a weak match when similarity is too low', () => {
        const baseTask = createTask()

        const candidateTask = createTask({
            id: 'task-3',
            title: 'Accessibility tips',
            description: 'General best practices',
            labelIds: ['other'],
        })

        const score = scoreSimilarTaskForTask(baseTask, candidateTask, {
            sharedNoteCount: 0,
            sharedLinkCount: 0,
            sharedLabelCount: 0,
        })

        expect(score).toBeNull()
    })
})
//#endregion tests

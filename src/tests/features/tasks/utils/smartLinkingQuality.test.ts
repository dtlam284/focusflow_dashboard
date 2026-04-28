import { describe, expect, it } from 'vitest'
import { applySuggestionQualityGate } from '@/features/tasks/utils/smartLinkingQuality'

//#region fixtures
const createResult = (
    overrides?: Partial<{
        entityType: string
        entity: { id: string }
        score: number
        reasons: string[]
    }>,
) => ({
    entityType: 'note',
    entity: { id: 'entity-1' },
    score: 10,
    reasons: ['Matched keywords'],
    ...overrides,
})
//#endregion fixtures

//#region tests
describe('smartLinkingQuality', () => {
    it('filters out items below the minimum score', () => {
        const results = [
            createResult({
                entity: { id: 'strong' },
                score: 9,
            }),
            createResult({
                entity: { id: 'weak' },
                score: 2,
            }),
        ]

        const output = applySuggestionQualityGate(results, {
            minScore: 3,
        })

        expect(output).toHaveLength(1)
        expect(output[0]?.entity.id).toBe('strong')
    })

    it('dedupes by entity type and entity id', () => {
        const results = [
            createResult({
                entityType: 'note',
                entity: { id: 'same-id' },
                score: 12,
            }),
            createResult({
                entityType: 'note',
                entity: { id: 'same-id' },
                score: 8,
            }),
            createResult({
                entityType: 'link',
                entity: { id: 'same-id' },
                score: 7,
            }),
        ]

        const output = applySuggestionQualityGate(results)

        expect(output).toHaveLength(2)
        expect(output[0]?.entityType).toBe('note')
        expect(output[0]?.score).toBe(12)
        expect(output[1]?.entityType).toBe('link')
    })

    it('keeps only the top N highest scoring items', () => {
        const results = [
            createResult({ entity: { id: 'a' }, score: 5 }),
            createResult({ entity: { id: 'b' }, score: 9 }),
            createResult({ entity: { id: 'c' }, score: 7 }),
            createResult({ entity: { id: 'd' }, score: 11 }),
        ]

        const output = applySuggestionQualityGate(results, {
            maxResults: 2,
        })

        expect(output).toHaveLength(2)
        expect(output.map((item) => item.entity.id)).toEqual(['d', 'b'])
    })
})
//#endregion tests

export const SMART_LINKING_MIN_SUGGESTION_SCORE = 3
export const SIMILAR_TASK_MIN_SUGGESTION_SCORE = 5

export const SMART_LINKING_MAX_SUGGESTIONS = 5

export const SMART_LINKING_STRONG_MATCH_SCORE = 12
export const SIMILAR_TASK_STRONG_MATCH_SCORE = 14

//#region types
export interface IQualityScoredEntityResult {
    entityType: string
    entity: {
        id: string
    }
    score: number
}
//#endregion types

//#region helpers
const createQualityEntityKey = (
    entityType: string,
    entityId: string,
) => `${entityType}:${entityId}`

export function applySuggestionQualityGate<T extends IQualityScoredEntityResult>(
    items: T[],
    options?: {
        minScore?: number
        maxResults?: number
    },
): T[] {
    const {
        minScore = SMART_LINKING_MIN_SUGGESTION_SCORE,
        maxResults = SMART_LINKING_MAX_SUGGESTIONS,
    } = options ?? {}

    const sortedItems = [...items].sort((left, right) => right.score - left.score)

    const seenEntityKeys = new Set<string>()
    const dedupedItems: T[] = []

    for (const item of sortedItems) {
        if (item.score < minScore) {
            continue
        }

        const entityKey = createQualityEntityKey(item.entityType, item.entity.id)

        if (seenEntityKeys.has(entityKey)) {
            continue
        }

        seenEntityKeys.add(entityKey)
        dedupedItems.push(item)

        if (dedupedItems.length >= maxResults) {
            break
        }
    }

    return dedupedItems
}
//#endregion helpers

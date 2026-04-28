import { extractKeywordsFromParts } from '@/features/tasks/utils/smartLinkingKeywords'
import type { ILink } from '@/features/links/types/linkTypes'
import type { INote } from '@/features/notes/types/noteTypes'
import type { ITask } from '@/features/tasks/types/taskTypes'

//#region constants
export const SMART_LINKING_MIN_RELEVANCE_SCORE = 3

const TITLE_KEYWORD_MATCH_SCORE = 5
const CONTENT_KEYWORD_MATCH_SCORE = 3
const CATEGORY_KEYWORD_MATCH_SCORE = 3
const RECENT_ATTACHMENT_BONUS_SCORE = 2

const MAX_TITLE_MATCHES_TO_SCORE = 3
const MAX_CONTENT_MATCHES_TO_SCORE = 3
const MAX_CATEGORY_MATCHES_TO_SCORE = 2
const MAX_REASON_KEYWORDS = 2
//#endregion constants

//#region props
export interface ISuggestionScore {
    entityType: 'note' | 'link' | 'task'
    entityId: string
    score: number
    reasons: string[]
}

interface IScoringOptions {
    isAlreadyAttached?: boolean
    isDismissed?: boolean
    hasRecentAttachmentSignal?: boolean
}
//#endregion props

//#region helpers
const getKeywordOverlap = (
    sourceKeywords: string[],
    candidateKeywords: string[],
): string[] => {
    const candidateKeywordSet = new Set(candidateKeywords)

    return sourceKeywords.filter((keyword) => candidateKeywordSet.has(keyword))
}

const excludeTakenKeywords = (
    keywords: string[],
    takenKeywords: string[],
): string[] => {
    const takenKeywordSet = new Set(takenKeywords)

    return keywords.filter((keyword) => !takenKeywordSet.has(keyword))
}

const getScoredMatchPoints = (
    matches: string[],
    pointsPerMatch: number,
    maxMatchesToScore: number,
): number => Math.min(matches.length, maxMatchesToScore) * pointsPerMatch

const formatKeywordList = (keywords: string[]) =>
    keywords.slice(0, MAX_REASON_KEYWORDS).join(', ')

const formatReason = (
    kind:
        | 'title'
        | 'content'
        | 'category'
        | 'task-title'
        | 'task-content',
    keywords: string[],
): string | null => {
    if (keywords.length === 0) {
        return null
    }

    const keywordList = formatKeywordList(keywords)

    if (kind === 'title') {
        return `Matched keywords in title: ${keywordList}`
    }

    if (kind === 'content') {
        return `Matched related content: ${keywordList}`
    }

    if (kind === 'task-title') {
        return `Matched task title: ${keywordList}`
    }

    if (kind === 'task-content') {
        return `Matched task details: ${keywordList}`
    }

    return `Matched category: ${keywordList}`
}

const getReasonPriority = (reason: string): number => {
    if (
        reason.includes('Matched task title') ||
        reason.includes('Matched keywords in title')
    ) {
        return 1
    }

    if (reason.includes('Recently attached')) {
        return 2
    }

    if (
        reason.includes('Matched task details') ||
        reason.includes('Matched related content')
    ) {
        return 3
    }

    if (reason.includes('Matched category')) {
        return 4
    }

    return 99
}

const orderReasons = (reasons: string[]): string[] =>
    Array.from(new Set(reasons))
        .sort((left, right) => getReasonPriority(left) - getReasonPriority(right))
        .slice(0, 2)

const buildSuggestionScore = (
    entityType: 'note' | 'link' | 'task',
    entityId: string,
    score: number,
    reasons: string[],
): ISuggestionScore | null => {
    if (score < SMART_LINKING_MIN_RELEVANCE_SCORE) {
        return null
    }

    return {
        entityType,
        entityId,
        score,
        reasons: orderReasons(reasons),
    }
}
//#endregion helpers

//#region exports
export function scoreNoteSuggestionForTask(
    task: ITask,
    note: INote,
    options: IScoringOptions = {},
): ISuggestionScore | null {
    const {
        isAlreadyAttached = false,
        isDismissed = false,
        hasRecentAttachmentSignal = false,
    } = options

    if (isAlreadyAttached || isDismissed) {
        return null
    }

    const taskKeywords = extractKeywordsFromParts([task.title, task.description])
    const noteTitleKeywords = extractKeywordsFromParts([note.title])
    const noteContentKeywords = extractKeywordsFromParts([note.content])
    const noteCategoryKeywords = extractKeywordsFromParts([note.category])

    const titleOverlap = getKeywordOverlap(taskKeywords, noteTitleKeywords)

    const contentOverlap = excludeTakenKeywords(
        getKeywordOverlap(taskKeywords, noteContentKeywords),
        titleOverlap,
    )

    const categoryOverlap = excludeTakenKeywords(
        getKeywordOverlap(taskKeywords, noteCategoryKeywords),
        [...titleOverlap, ...contentOverlap],
    )

    let score = 0
    const reasons: string[] = []

    const titleScore = getScoredMatchPoints(
        titleOverlap,
        TITLE_KEYWORD_MATCH_SCORE,
        MAX_TITLE_MATCHES_TO_SCORE,
    )
    score += titleScore

    const contentScore = getScoredMatchPoints(
        contentOverlap,
        CONTENT_KEYWORD_MATCH_SCORE,
        MAX_CONTENT_MATCHES_TO_SCORE,
    )
    score += contentScore

    const categoryScore = getScoredMatchPoints(
        categoryOverlap,
        CATEGORY_KEYWORD_MATCH_SCORE,
        MAX_CATEGORY_MATCHES_TO_SCORE,
    )
    score += categoryScore

    const titleReason = formatReason('title', titleOverlap)
    if (titleReason) {
        reasons.push(titleReason)
    }

    const contentReason = formatReason('content', contentOverlap)
    if (contentReason) {
        reasons.push(contentReason)
    }

    const categoryReason = formatReason('category', categoryOverlap)
    if (categoryReason) {
        reasons.push(categoryReason)
    }

    if (hasRecentAttachmentSignal) {
        score += RECENT_ATTACHMENT_BONUS_SCORE
        reasons.push('Recently attached in a similar task context')
    }

    return buildSuggestionScore('note', note.id, score, reasons)
}

export function scoreLinkSuggestionForTask(
    task: ITask,
    link: ILink,
    options: IScoringOptions = {},
): ISuggestionScore | null {
    const {
        isAlreadyAttached = false,
        isDismissed = false,
        hasRecentAttachmentSignal = false,
    } = options

    if (isAlreadyAttached || isDismissed) {
        return null
    }

    const taskKeywords = extractKeywordsFromParts([task.title, task.description])
    const linkTitleKeywords = extractKeywordsFromParts([link.title])
    const linkCategoryKeywords = extractKeywordsFromParts([link.category])

    const titleOverlap = getKeywordOverlap(taskKeywords, linkTitleKeywords)

    const categoryOverlap = excludeTakenKeywords(
        getKeywordOverlap(taskKeywords, linkCategoryKeywords),
        titleOverlap,
    )

    let score = 0
    const reasons: string[] = []

    const titleScore = getScoredMatchPoints(
        titleOverlap,
        TITLE_KEYWORD_MATCH_SCORE,
        MAX_TITLE_MATCHES_TO_SCORE,
    )
    score += titleScore

    const categoryScore = getScoredMatchPoints(
        categoryOverlap,
        CATEGORY_KEYWORD_MATCH_SCORE,
        MAX_CATEGORY_MATCHES_TO_SCORE,
    )
    score += categoryScore

    const titleReason = formatReason('title', titleOverlap)
    if (titleReason) {
        reasons.push(titleReason)
    }

    const categoryReason = formatReason('category', categoryOverlap)
    if (categoryReason) {
        reasons.push(categoryReason)
    }

    if (hasRecentAttachmentSignal) {
        score += RECENT_ATTACHMENT_BONUS_SCORE
        reasons.push('Recently attached in a similar task context')
    }

    return buildSuggestionScore('link', link.id, score, reasons)
}

export function scoreTaskSuggestionForNote(
    task: ITask,
    note: INote,
    options: IScoringOptions = {},
): ISuggestionScore | null {
    const {
        isAlreadyAttached = false,
        isDismissed = false,
        hasRecentAttachmentSignal = false,
    } = options

    if (isAlreadyAttached || isDismissed) {
        return null
    }

    const noteKeywords = extractKeywordsFromParts([note.title, note.content])
    const noteCategoryKeywords = extractKeywordsFromParts([note.category])

    const taskTitleKeywords = extractKeywordsFromParts([task.title])
    const taskContentKeywords = extractKeywordsFromParts([task.description])
    const taskKeywords = extractKeywordsFromParts([task.title, task.description])

    const titleOverlap = getKeywordOverlap(noteKeywords, taskTitleKeywords)

    const contentOverlap = excludeTakenKeywords(
        getKeywordOverlap(noteKeywords, taskContentKeywords),
        titleOverlap,
    )

    const categoryOverlap = excludeTakenKeywords(
        getKeywordOverlap(noteCategoryKeywords, taskKeywords),
        [...titleOverlap, ...contentOverlap],
    )

    let score = 0
    const reasons: string[] = []

    score += getScoredMatchPoints(
        titleOverlap,
        TITLE_KEYWORD_MATCH_SCORE,
        MAX_TITLE_MATCHES_TO_SCORE,
    )

    score += getScoredMatchPoints(
        contentOverlap,
        CONTENT_KEYWORD_MATCH_SCORE,
        MAX_CONTENT_MATCHES_TO_SCORE,
    )

    score += getScoredMatchPoints(
        categoryOverlap,
        CATEGORY_KEYWORD_MATCH_SCORE,
        MAX_CATEGORY_MATCHES_TO_SCORE,
    )

    const titleReason = formatReason('task-title', titleOverlap)
    if (titleReason) {
        reasons.push(titleReason)
    }

    const contentReason = formatReason('task-content', contentOverlap)
    if (contentReason) {
        reasons.push(contentReason)
    }

    const categoryReason = formatReason('category', categoryOverlap)
    if (categoryReason) {
        reasons.push(categoryReason)
    }

    if (hasRecentAttachmentSignal) {
        score += RECENT_ATTACHMENT_BONUS_SCORE
        reasons.push('Recently attached in a similar task context')
    }

    return buildSuggestionScore('task', task.id, score, reasons)
}

export function scoreTaskSuggestionForLink(
    task: ITask,
    link: ILink,
    options: IScoringOptions = {},
): ISuggestionScore | null {
    const {
        isAlreadyAttached = false,
        isDismissed = false,
        hasRecentAttachmentSignal = false,
    } = options

    if (isAlreadyAttached || isDismissed) {
        return null
    }

    const linkKeywords = extractKeywordsFromParts([link.title])
    const linkCategoryKeywords = extractKeywordsFromParts([link.category])

    const taskTitleKeywords = extractKeywordsFromParts([task.title])
    const taskContentKeywords = extractKeywordsFromParts([task.description])
    const taskKeywords = extractKeywordsFromParts([task.title, task.description])

    const titleOverlap = getKeywordOverlap(linkKeywords, taskTitleKeywords)

    const contentOverlap = excludeTakenKeywords(
        getKeywordOverlap(linkKeywords, taskContentKeywords),
        titleOverlap,
    )

    const categoryOverlap = excludeTakenKeywords(
        getKeywordOverlap(linkCategoryKeywords, taskKeywords),
        [...titleOverlap, ...contentOverlap],
    )

    let score = 0
    const reasons: string[] = []

    score += getScoredMatchPoints(
        titleOverlap,
        TITLE_KEYWORD_MATCH_SCORE,
        MAX_TITLE_MATCHES_TO_SCORE,
    )

    score += getScoredMatchPoints(
        contentOverlap,
        CONTENT_KEYWORD_MATCH_SCORE,
        MAX_CONTENT_MATCHES_TO_SCORE,
    )

    score += getScoredMatchPoints(
        categoryOverlap,
        CATEGORY_KEYWORD_MATCH_SCORE,
        MAX_CATEGORY_MATCHES_TO_SCORE,
    )

    const titleReason = formatReason('task-title', titleOverlap)
    if (titleReason) {
        reasons.push(titleReason)
    }

    const contentReason = formatReason('task-content', contentOverlap)
    if (contentReason) {
        reasons.push(contentReason)
    }

    const categoryReason = formatReason('category', categoryOverlap)
    if (categoryReason) {
        reasons.push(categoryReason)
    }

    if (hasRecentAttachmentSignal) {
        score += RECENT_ATTACHMENT_BONUS_SCORE
        reasons.push('Recently attached in a similar task context')
    }

    return buildSuggestionScore('task', task.id, score, reasons)
}
//#endregion exports

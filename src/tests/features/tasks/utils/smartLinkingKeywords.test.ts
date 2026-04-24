//#region imports
import { describe, expect, it } from 'vitest'
import { extractKeywords, extractKeywordsFromParts } from '@/features/tasks/utils/smartLinkingKeywords'
//#endregion imports

//#region tests
describe('smartLinkingKeywords', () => {
  describe('extractKeywords', () => {
    it('normalizes casing, trims whitespace, and removes punctuation', () => {
      expect(
        extractKeywords('   Frontend, ACCESSIBILITY!! review   '),
      ).toEqual(['frontend', 'accessibility', 'review'])
    })

    it('removes basic stopwords and keeps meaningful short tokens like ui and ux', () => {
      expect(
        extractKeywords('The task is for a UI review with the UX team'),
      ).toEqual(['task', 'ui', 'review', 'ux', 'team'])
    })

    it('deduplicates repeated keywords while preserving order', () => {
      expect(
        extractKeywords('design design DESIGN system system review'),
      ).toEqual(['design', 'system', 'review'])
    })

    it('normalizes Vietnamese diacritics consistently', () => {
      expect(
        extractKeywords('Thiết kế giao diện frontend'),
      ).toEqual(extractKeywords('thiet ke giao dien frontend'))
    })

    it('returns an empty array for empty or noise-only input', () => {
      expect(extractKeywords('   ')).toEqual([])
      expect(extractKeywords('!!! ??? ...')).toEqual([])
    })
  })

  describe('extractKeywordsFromParts', () => {
    it('merges multiple text parts and ignores nullish or empty values', () => {
      expect(
        extractKeywordsFromParts([
          'Build dashboard filters',
          undefined,
          'Accessibility review',
          '',
          null,
        ]),
      ).toEqual(['build', 'dashboard', 'filters', 'accessibility', 'review'])
    })
  })
})
//#endregion tests

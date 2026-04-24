//#region constants
export const SMART_LINKING_MIN_KEYWORD_LENGTH = 2

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g
const BASIC_PUNCTUATION_REGEX = /[^\p{L}\p{N}\s]+/gu
const WHITESPACE_REGEX = /\s+/g

const SMART_LINKING_STOPWORDS = new Set([
  // English
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'into',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
  // Vietnamese
  'bi',
  'boi',
  'cac',
  'cho',
  'cua',
  'do',
  'da',
  'dang',
  'de',
  'den',
  'duoc',
  'khi',
  'khong',
  'la',
  'lam',
  'mot',
  'ma',
  'nam',
  'neu',
  'nhung',
  'se',
  'sau',
  'tai',
  'theo',
  'thi',
  'tren',
  'trong',
  'tu',
  'va',
  'voi',
])
//#endregion constants

//#region helpers
const normalizeKeywordSource = (input: string): string =>
  input
    .normalize('NFKD')
    .replace(COMBINING_MARKS_REGEX, '')
    .toLowerCase()
    .trim()
    .replace(BASIC_PUNCTUATION_REGEX, ' ')
    .replace(WHITESPACE_REGEX, ' ')
    .trim()

const toUniqueTokens = (tokens: string[]): string[] => {
  const seen = new Set<string>()
  const uniqueTokens: string[] = []

  for (const token of tokens) {
    if (seen.has(token)) {
      continue
    }

    seen.add(token)
    uniqueTokens.push(token)
  }

  return uniqueTokens
}
//#endregion helpers

//#region exports
export function extractKeywords(input: string): string[] {
  if (!input.trim()) {
    return []
  }

  const normalizedInput = normalizeKeywordSource(input)

  if (!normalizedInput) {
    return []
  }

  const tokens = normalizedInput
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length >= SMART_LINKING_MIN_KEYWORD_LENGTH)
    .filter((token) => !SMART_LINKING_STOPWORDS.has(token))

  return toUniqueTokens(tokens)
}

export function extractKeywordsFromParts(
  parts: Array<string | null | undefined>,
): string[] {
  const mergedInput = parts
    .filter((part): part is string => typeof part === 'string')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')

  return extractKeywords(mergedInput)
}
//#endregion exports

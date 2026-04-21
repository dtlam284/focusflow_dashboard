import type { RootState } from '@/app/store/store'
import type { ILink } from '@/features/links/types/linkTypes'

//#region based selectors
export const selectLinksState = (state: RootState) => state.links
export const selectLinkItems = (state: RootState) => state.links.items
export const selectLinkFilters = (state: RootState) => state.links.filters
//#endregion based selectors

//#region filtered selectors
export const selectFilteredLinks = (state: RootState): ILink[] => {
  const { items, filters } = state.links
  const keyword = filters.keyword.trim().toLowerCase()

  return [...items]
    .filter((link) => {
      const matchesCategory = filters.category === 'all' || link.category === filters.category

      const matchesKeyword =
        keyword.length === 0 ||
        link.title.toLowerCase().includes(keyword) ||
        link.url.toLowerCase().includes(keyword) ||
        link.category.toLowerCase().includes(keyword)

      return matchesCategory && matchesKeyword
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
//#endregion filtered selectors

//#region ordered selectors
export const selectLinksCount = (state: RootState) => state.links.items.length
//#endregion ordered selectors

//#region combined selectors
export const selectFilteredLinksCount = (state: RootState) => selectFilteredLinks(state).length

export const selectLinksByCategory = (state: RootState) => {
  return state.links.items.reduce<Record<string, number>>((acc, link) => {
    acc[link.category] = (acc[link.category] ?? 0) + 1
    return acc
  }, {})
}
//#endregion combined selectors

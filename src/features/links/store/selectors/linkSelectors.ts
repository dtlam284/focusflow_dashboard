import type { RootState } from '../../../../app/store/store'
import type { ILink } from '../../types/linkTypes'

export const selectLinkState = (state: RootState) => state.links
export const selectLinkItems = (state: RootState) => state.links.items
export const selectLinkFilters = (state: RootState) => state.links.filters

export const selectFilteredLinks = (state: RootState): ILink[] => {
  const { items, filters } = state.links
  const keyword = filters.keyword.trim().toLowerCase()

  return items.filter((link) => {
    const matchesKeyword =
      keyword.length === 0 ||
      link.title.toLowerCase().includes(keyword) ||
      link.url.toLowerCase().includes(keyword) ||
      link.description?.toLowerCase().includes(keyword)

    const matchesCategory =
      filters.category === 'all' || link.category === filters.category

    return matchesKeyword && matchesCategory
  })
}
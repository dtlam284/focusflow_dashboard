import { LINK_CATEGORY_OPTIONS, type ILinkFilters } from '@/features/links/types/linkTypes'

//#region types
type LinksFilterBarProps = {
  keyword: string
  category: ILinkFilters['category']
  totalCount: number
  filteredCount: number
  onKeywordChange: (value: string) => void
  onCategoryChange: (value: ILinkFilters['category']) => void
  onReset: () => void
}
//#endregion types

//#region component
export function LinksFilterBar({
  keyword,
  category,
  totalCount,
  filteredCount,
  onKeywordChange,
  onCategoryChange,
  onReset,
}: LinksFilterBarProps) {
  //#region variables
  const isFiltered = keyword.trim().length > 0 || category !== 'all'
  //#endregion variables

  //#region render
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <div className="space-y-2">
            <label htmlFor="links-keyword" className="text-sm font-medium">
              Search
            </label>
            <input
              id="links-keyword"
              type="text"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Search by title, URL, or category"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="links-category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="links-category"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value as ILinkFilters['category'])}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            >
              <option value="all">All categories</option>
              {LINK_CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {formatCategoryLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredCount}</span>
            {' / '}
            <span className="font-medium text-foreground">{totalCount}</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            disabled={!isFiltered}
            className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
  //#endregion render
}
//#endregion component

//#region utils
function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}
//#endregion utils

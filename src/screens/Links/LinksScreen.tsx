import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { LinkDetailPanel } from '@/features/links/components/LinkDetailPanel'
import { LinkForm } from '@/features/links/components/LinkForm'
import { LinksFilterBar } from '@/features/links/components/LinksFilterBar'
import { LinksList } from '@/features/links/components/LinksList'
import { type LinkFormValues } from '@/features/links/schemas/linkSchema'
import { openLinkDetail } from '@/features/links/store/slices/linkDetailSlice'
import { addLink, deleteLink, resetLinkFilters, setLinkFilters } from '@/features/links/store/slices/linkSlice'
import { selectFilteredLinks, selectFilteredLinksCount, selectLinkFilters, selectLinksCount } from '@/features/links/store/selectors/linkSelectors' 
import type { ILink } from '@/features/links/types/linkTypes'

//#region component
export function LinksScreen() {
  //#region hooks
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region selectors
  const filters = useAppSelector(selectLinkFilters)
  const links = useAppSelector(selectFilteredLinks)
  const totalCount = useAppSelector(selectLinksCount)
  const filteredCount = useAppSelector(selectFilteredLinksCount)
  //#endregion selectors

  //#region handlers
  const handleCreateLink = (values: LinkFormValues) => {
    const now = new Date().toISOString()

    dispatch(
      addLink({
        id: crypto.randomUUID(),
        title: values.title,
        url: values.url,
        category: values.category,
        createdAt: now,
        updatedAt: now,
      }),
    )
  }

  const handleDeleteLink = (id: string) => {
    dispatch(deleteLink(id))
  }

  const handleOpenLinkDetail = (link: ILink) => {
    dispatch(openLinkDetail(link.id))
  }

  const handleKeywordChange = (keyword: string) => {
    dispatch(setLinkFilters({ keyword }))
  }

  const handleCategoryChange = (category: typeof filters.category) => {
    dispatch(setLinkFilters({ category }))
  }

  const handleResetFilters = () => {
    dispatch(resetLinkFilters())
  }
  //#endregion handlers

  //#region render
  return (
    <section className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Links</h1>
        {/* <p className='text-sm text-muted-foreground'>
          Save useful resources and open them quickly in a safe new tab.
        </p> */}
      </div>

      <div className='grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]'>
        <div className='xl:sticky xl:top-6 xl:self-start'>
          <LinkForm onSubmit={handleCreateLink} />
        </div>

        <div className='space-y-4'>
          <LinksFilterBar
            keyword={filters.keyword}
            category={filters.category}
            totalCount={totalCount}
            filteredCount={filteredCount}
            onKeywordChange={handleKeywordChange}
            onCategoryChange={handleCategoryChange}
            onReset={handleResetFilters}
          />

          <LinksList
            links={links}
            onDelete={handleDeleteLink}
            onOpenDetail={handleOpenLinkDetail}
          />
        </div>
      </div>

      <LinkDetailPanel />
    </section>
  )
  //#endregion render
}
//#endregion component

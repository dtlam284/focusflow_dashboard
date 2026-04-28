import type { ILink } from '@/features/links/types/linkTypes'
import { LinkCard } from './LinkCard'

//#region types
type LinksListProps = {
  links: ILink[]
  onDelete: (id: string) => void
  onEdit?: (link: ILink) => void
  onOpenDetail?: (link: ILink) => void
}
//#endregion types

//#region component
export function LinksList({ links, onDelete, onEdit, onOpenDetail }: LinksListProps) {
  if (links.length === 0) {
    //#region render
    return (
      <div className='rounded-2xl border border-dashed bg-card px-6 py-10 text-center shadow-sm'>
        <div className='mx-auto max-w-sm space-y-2'>
          <h3 className='text-base font-semibold'>No links found</h3>
          <p className='text-sm text-muted-foreground'>
            Add your first useful resource or adjust the current search and category filter.
          </p>
        </div>
      </div>
    )
    //#endregion render
  }

  //#region render
  return (
    <div className='space-y-3'>
      {links.map((link) => (
        <LinkCard
          key={`${link.id}-${link.updatedAt}`}
          link={link}
          onDelete={onDelete}
          onEdit={onEdit}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </div>
  )
  //#endregion render
}
//#endregion component

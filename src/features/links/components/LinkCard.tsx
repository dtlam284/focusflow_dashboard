import { Info } from 'lucide-react'
import type { ILink } from '@/features/links/types/linkTypes'

//#region types
type LinkCardProps = {
  link: ILink
  onDelete: (id: string) => void
  onEdit?: (link: ILink) => void
  onOpenDetail?: (link: ILink) => void
}
//#endregion types

//#region component
export function LinkCard({ link, onDelete, onEdit, onOpenDetail }: LinkCardProps) {
  const hostname = getHostname(link.url)
  const displayUrl = getDisplayUrl(link.url)

  //#region render
  return (
    <article className='rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='line-clamp-2 text-base font-semibold text-foreground'>{link.title}</h3>
            <span className='inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground'>
              {formatCategoryLabel(link.category)}
            </span>
          </div>

          <div className='space-y-1'>
            {hostname ? (
              <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                {hostname}
              </p>
            ) : null}

            <p className='truncate text-sm text-muted-foreground' title={link.url}>
              {displayUrl}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <a
            href={link.url}
            target='_blank'
            rel='noreferrer noopener'
            className='inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90'
          >
            Open
          </a>

          {onOpenDetail ? (
            <button
              type='button'
              onClick={() => onOpenDetail(link)}
              className='inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition hover:bg-accent'
            >
              <Info className='mr-1.5 h-4 w-4' />
              Details
            </button>
          ) : null}

          {onEdit ? (
            <button
              type='button'
              onClick={() => onEdit(link)}
              className='inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition hover:bg-accent'
            >
              Edit
            </button>
          ) : null}

          <button
            type='button'
            onClick={() => onDelete(link.id)}
            className='inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium text-destructive transition hover:bg-accent'
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
  //#endregion render
}
//#endregion component

//#region utils
function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function getDisplayUrl(url: string, maxLength = 56) {
  const value = url.replace(/^https?:\/\//, '')

  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1)}…`
}

function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}
//#endregion utils

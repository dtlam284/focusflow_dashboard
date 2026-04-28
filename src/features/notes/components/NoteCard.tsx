import { Edit3, Info, Pin, PinOff, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/utils'
import type { INote } from '../types/noteTypes'

//#region props
export interface INoteCardProps {
  note: INote
  onEdit: (note: INote) => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onPreview: (note: INote) => void
  onOpenDetail?: (note: INote) => void
}
//#endregion props

//#region ui maps
const noteAccentStyles: Record<INote['color'], string> = {
  default: 'border-slate-200 before:bg-slate-300 dark:border-slate-800 dark:before:bg-slate-600',
  blue: 'border-blue-200 before:bg-blue-500 dark:border-blue-900 dark:before:bg-blue-400',
  green:
    'border-emerald-200 before:bg-emerald-500 dark:border-emerald-900 dark:before:bg-emerald-400',
  yellow: 'border-amber-200 before:bg-amber-500 dark:border-amber-900 dark:before:bg-amber-400',
  rose: 'border-rose-200 before:bg-rose-500 dark:border-rose-900 dark:before:bg-rose-400',
  violet: 'border-violet-200 before:bg-violet-500 dark:border-violet-900 dark:before:bg-violet-400',
}

const categoryBadgeStyles: Record<INote['category'], string> = {
  work: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  personal: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  idea: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  learning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  other: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
}
//#endregion ui maps

//#region helpers
const formatCategory = (category: INote['category']) => {
  switch (category) {
    case 'work':
      return 'Work'
    case 'personal':
      return 'Personal'
    case 'idea':
      return 'Idea'
    case 'learning':
      return 'Learning'
    default:
      return 'Other'
  }
}
//#endregion helpers

//#region component
export function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onPreview,
  onOpenDetail,
}: INoteCardProps) {
  //#region derived values
  const previewContent = note.content.replace(/\s+/g, ' ').trim()
  //#endregion derived values

  //#region render
  return (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden border bg-white shadow-sm transition-all duration-200 before:absolute before:left-0 before:top-0 before:h-full before:w-1.5 hover:-translate-y-1 hover:shadow-lg dark:bg-slate-950',
        noteAccentStyles[note.color],
        note.isPinned && 'ring-1 ring-amber-300 dark:ring-amber-700',
      )}
    >
      <CardHeader className='flex flex-row items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800'>
        <div className='min-w-0 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                categoryBadgeStyles[note.category],
              )}
            >
              <Tag className='h-3.5 w-3.5' />
              {formatCategory(note.category)}
            </span>

            {note.isPinned ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'>
                <Pin className='h-3.5 w-3.5' />
                Pinned
              </span>
            ) : null}
          </div>

          <button
            type='button'
            onClick={() => onPreview(note)}
            className='block w-full text-left outline-none'
          >
            <h3 className='line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100'>
              {note.title}
            </h3>
          </button>
        </div>

        <Button
          size='icon'
          variant='ghost'
          className='h-8 w-8 shrink-0'
          onClick={() => onTogglePin(note.id)}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
          title={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          {note.isPinned ? <PinOff className='h-4 w-4' /> : <Pin className='h-4 w-4' />}
        </Button>
      </CardHeader>

      <CardContent className='py-3'>
        <button
          type='button'
          onClick={() => onPreview(note)}
          className='block w-full text-left outline-none'
        >
          <div className='h-[52px] overflow-hidden'>
            <p className='line-clamp-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300'>
              {previewContent}
            </p>
          </div>
        </button>
      </CardContent>

      <CardFooter className='flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800'>
        {onOpenDetail ? (
          <Button size='sm' variant='outline' onClick={() => onOpenDetail(note)}>
            <Info className='h-4 w-4' />
            Details
          </Button>
        ) : null}

        <Button size='sm' variant='outline' onClick={() => onEdit(note)}>
          <Edit3 className='h-4 w-4' />
          Edit
        </Button>

        <Button size='sm' variant='destructive' onClick={() => onDelete(note.id)}>
          <Trash2 className='h-4 w-4' />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
  //#endregion render
}
//#endregion component

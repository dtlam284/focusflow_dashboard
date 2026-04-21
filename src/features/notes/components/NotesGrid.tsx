import * as React from 'react'

import { EmptyState } from '@/components/shared/EmptyState'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/utils'

import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import type { INote } from '../types/noteTypes'

//#region props
type NoteFormSubmitHandler = React.ComponentProps<typeof NoteForm>['onSubmit']

export interface INotesGridProps {
  notes: INote[]
  editingNoteId?: string | null
  onEdit: (note: INote) => void
  onSaveEdit: NoteFormSubmitHandler
  onCancelEdit: () => void
  onDelete: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onPreview: (note: INote) => void
  emptyAction?: React.ReactNode
  className?: string
}
//#endregion props

//#region component
export function NotesGrid({
  notes,
  editingNoteId,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onTogglePin,
  onPreview,
  emptyAction,
  className,
}: INotesGridProps) {
  //#region hooks
  const { t } = useI18n()
  //#endregion hooks

  //#region guards
  if (notes.length === 0) {
    return (
      <EmptyState
        className={cn('min-h-[280px]', className)}
        title={t('No notes yet')}
        description={t(
          'Create your first note to capture ideas, reminders, or useful information.',
        )}
        action={emptyAction}
      />
    )
  }
  //#endregion guards

  //#region render
  return (
    <div className={cn('grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {notes.map((note) =>
        note.id === editingNoteId ? (
          <NoteForm
            key={`edit-${note.id}`}
            mode="edit"
            initialValues={{
              title: note.title,
              content: note.content,
              color: note.color,
              category: note.category,
            }}
            onSubmit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        ) : (
          <NoteCard
            key={`${note.id}-${note.updatedAt}`}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
            onPreview={onPreview}
          />
        ),
      )}
    </div>
  )
  //#endregion render
}
//#endregion component

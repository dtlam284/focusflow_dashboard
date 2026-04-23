import * as React from 'react'

import { useI18n } from '@/contexts/I18nContext'
import { PageHeader } from '@/components/shared/PageHeader'
import { NoteForm } from '@/features/notes/components/NoteForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { NotesGrid } from '@/features/notes/components/NotesGrid'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { NotePreviewDialog } from '@/features/notes/components/NotePreviewDialog'
import { NotesPinnedSection } from '@/features/notes/components/NotesPinnedSection'

import { addNote, deleteNote, resetNoteFilters, setNoteFilters, togglePinNote, updateNote } from '@/features/notes/store/slices/noteSlice'
import { selectFilteredNotesCount, selectFilteredPinnedNotes, selectFilteredUnpinnedNotes, selectNoteFilters, selectNoteItems, selectNotesCount } from '@/features/notes/store/selectors/noteSelectors'

import type { INote } from '@/features/notes/types/noteTypes'
import type { NoteFormValues } from '@/features/notes/schemas/noteSchema'

//#region component
export function NotesScreen() {
  //#region hooks
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  //#endregion hooks

  //#region selectors
  const notes = useAppSelector(selectNoteItems)
  const filters = useAppSelector(selectNoteFilters)
  const pinnedNotes = useAppSelector(selectFilteredPinnedNotes)
  const unpinnedNotes = useAppSelector(selectFilteredUnpinnedNotes)
  const totalCount = useAppSelector(selectNotesCount)
  const filteredCount = useAppSelector(selectFilteredNotesCount)
  //#endregion selectors

  //#region state
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null)
  const [notePendingDelete, setNotePendingDelete] = React.useState<INote | null>(null)
  const [previewNote, setPreviewNote] = React.useState<INote | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)

  const editingNote = notes.find((note) => note.id === editingNoteId) ?? null
  const isFiltered = filters.keyword.trim().length > 0
  //#endregion state

  //#region handlers
  const handleCreateNote = (values: NoteFormValues) => {
    const now = new Date().toISOString()

    dispatch(
      addNote({
        id: crypto.randomUUID(),
        title: values.title,
        content: values.content,
        color: values.color,
        category: values.category,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      }),
    )
  }

  const handleUpdateNote = (values: NoteFormValues) => {
    if (!editingNote) return

    dispatch(
      updateNote({
        id: editingNote.id,
        changes: {
          title: values.title,
          content: values.content,
          color: values.color,
          category: values.category,
        },
      }),
    )

    setEditingNoteId(null)
  }

  const handleStartEdit = (note: INote) => {
    setEditingNoteId(note.id)
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
  }

  const handleTogglePin = (noteId: string) => {
    dispatch(togglePinNote(noteId))
  }

  const handlePreviewNote = (note: INote) => {
    setPreviewNote(note)
    setIsPreviewOpen(true)
  }

  const handleRequestDelete = (noteId: string) => {
    const note = notes.find((item) => item.id === noteId) ?? null
    setNotePendingDelete(note)
  }

  const handleConfirmDelete = () => {
    if (!notePendingDelete) return

    dispatch(deleteNote(notePendingDelete.id))

    if (editingNoteId === notePendingDelete.id) {
      setEditingNoteId(null)
    }

    if (previewNote?.id === notePendingDelete.id) {
      setPreviewNote(null)
      setIsPreviewOpen(false)
    }

    setNotePendingDelete(null)
  }

  const handleKeywordChange = (keyword: string) => {
    dispatch(setNoteFilters({ keyword }))
  }

  const handleResetFilters = () => {
    dispatch(resetNoteFilters())
  }
  //#endregion handlers

  //#region render
  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Notes')}
        description={t(
          'Capture ideas, reminders, and useful information in a clean note workspace.',
        )}
      />

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <label htmlFor="notes-search" className="text-sm font-medium">
              {t('Search')}
            </label>
            <input
              id="notes-search"
              type="text"
              value={filters.keyword}
              onChange={(event) => handleKeywordChange(event.target.value)}
              placeholder={t('Search notes by title or content')}
              data-skip-auto-label="true"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {t('Showing')} <span className="font-medium text-foreground">{filteredCount}</span>
              {' / '}
              <span className="font-medium text-foreground">{totalCount}</span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!isFiltered}
              className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
            >
              {t('Reset')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start xl:h-fit">
          <NoteForm key="create-note" mode="create" onSubmit={handleCreateNote} />
        </aside>

        <div className="space-y-6">
          <NotesPinnedSection
            notes={pinnedNotes}
            editingNoteId={editingNoteId}
            onEdit={handleStartEdit}
            onSaveEdit={handleUpdateNote}
            onCancelEdit={handleCancelEdit}
            onDelete={handleRequestDelete}
            onTogglePin={handleTogglePin}
            onPreview={handlePreviewNote}
          />

          <NotesGrid
            notes={unpinnedNotes}
            editingNoteId={editingNoteId}
            onEdit={handleStartEdit}
            onSaveEdit={handleUpdateNote}
            onCancelEdit={handleCancelEdit}
            onDelete={handleRequestDelete}
            onTogglePin={handleTogglePin}
            onPreview={handlePreviewNote}
          />
        </div>
      </div>

      <NotePreviewDialog
        note={previewNote}
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open)
          if (!open) setPreviewNote(null)
        }}
        onEdit={handleStartEdit}
      />

      <ConfirmDialog
        open={Boolean(notePendingDelete)}
        title={t('Delete note')}
        description={
          notePendingDelete
            ? t('Are you sure you want to delete "{title}"?', {
                title: notePendingDelete.title,
              })
            : t('Are you sure you want to delete this note?')
        }
        confirmLabel={t('Delete')}
        cancelLabel={t('Cancel')}
        onOpenChange={(open) => {
          if (!open) setNotePendingDelete(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
  //#endregion render
}
//#endregion component

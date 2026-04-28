import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NoteCard } from '@/features/notes/components/NoteCard'
import type { INote } from '@/features/notes/types/noteTypes'

//#region fixtures
const createNote = (overrides: Partial<INote> = {}): INote => ({
  id: 'note-1',
  title: 'Accessibility checklist',
  content: 'Keyboard navigation review for dashboard filters',
  color: 'blue',
  category: 'learning',
  isPinned: false,
  createdAt: '2026-04-27T00:00:00.000Z',
  updatedAt: '2026-04-27T00:00:00.000Z',
  ...overrides,
})
//#endregion fixtures

//#region tests
describe('NoteCard', () => {
  it('calls onOpenDetail with the correct note when clicking Details', async () => {
    const user = userEvent.setup()
    const note = createNote()
    const onOpenDetail = vi.fn()

    render(
      <NoteCard
        note={note}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePin={vi.fn()}
        onPreview={vi.fn()}
        onOpenDetail={onOpenDetail}
      />,
    )

    await user.click(screen.getByRole('button', { name: /details/i }))

    expect(onOpenDetail).toHaveBeenCalledTimes(1)
    expect(onOpenDetail).toHaveBeenCalledWith(note)
  })

  it('does not render the Details button when onOpenDetail is missing', () => {
    render(
      <NoteCard
        note={createNote()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onTogglePin={vi.fn()}
        onPreview={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /details/i }),
    ).not.toBeInTheDocument()
  })
})
//#endregion tests

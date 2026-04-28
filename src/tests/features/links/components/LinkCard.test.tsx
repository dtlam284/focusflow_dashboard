import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LinkCard } from '@/features/links/components/LinkCard'
import type { ILink } from '@/features/links/types/linkTypes'

//#region fixtures
const createLink = (overrides: Partial<ILink> = {}): ILink => ({
  id: 'link-1',
  title: 'Keyboard navigation patterns',
  url: 'https://example.com/keyboard-navigation-patterns',
  category: 'design',
  createdAt: '2026-04-27T00:00:00.000Z',
  updatedAt: '2026-04-27T00:00:00.000Z',
  ...overrides,
})
//#endregion fixtures

//#region tests
describe('LinkCard', () => {
  it('calls onOpenDetail with the correct link when clicking Details', async () => {
    const user = userEvent.setup()
    const link = createLink()
    const onOpenDetail = vi.fn()

    render(
      <LinkCard
        link={link}
        onDelete={vi.fn()}
        onOpenDetail={onOpenDetail}
      />,
    )

    await user.click(screen.getByRole('button', { name: /details/i }))

    expect(onOpenDetail).toHaveBeenCalledTimes(1)
    expect(onOpenDetail).toHaveBeenCalledWith(link)
  })

  it('does not render the Details button when onOpenDetail is missing', () => {
    render(
      <LinkCard
        link={createLink()}
        onDelete={vi.fn()}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /details/i }),
    ).not.toBeInTheDocument()
  })
})
//#endregion tests

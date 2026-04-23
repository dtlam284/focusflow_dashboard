import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LinkForm } from '@/features/links/components/LinkForm'

//#region tests
describe('LinkForm', () => {
  it('does not submit when URL is invalid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<LinkForm mode="create" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/title/i), 'React docs')
    await user.type(screen.getByLabelText(/url/i), 'https://')

    await user.click(
      screen.getByRole('button', {
        name: /add link/i,
      }),
    )

    expect(onSubmit).not.toHaveBeenCalled()

    expect(await screen.findByText('Please enter a valid URL')).toBeInTheDocument()
  })
})
//#endregion tests

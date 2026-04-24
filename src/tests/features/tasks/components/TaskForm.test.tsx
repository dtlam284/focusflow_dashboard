import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { store } from '@/app/store/store'
import { I18nProvider } from '@/contexts/I18nContext'
import { TaskForm } from '@/features/tasks/components/TaskForm'

//#region tests
describe('TaskForm', () => {
  it('does not submit when title is missing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Provider store={store}>
        <I18nProvider>
          <TaskForm mode='create' onSubmit={onSubmit} />
        </I18nProvider>
      </Provider>,
    )

    await user.click(
      screen.getByRole('button', {
        name: /add task/i,
      }),
    )

    expect(onSubmit).not.toHaveBeenCalled()

    expect(
      await screen.findByText(/please enter a task/i),
    ).toBeInTheDocument()
  })
})
//#endregion tests

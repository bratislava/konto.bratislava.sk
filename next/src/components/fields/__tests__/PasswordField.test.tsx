import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PasswordField from '../PasswordField'

jest.mock('src/assets/ui-icons', () => ({
  __esModule: true,
  EyeIcon: () => <span data-testid="eye-icon" />,
  EyeHiddenIcon: () => <span data-testid="eye-hidden-icon" />,
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'FieldHeader.optional': '(Nepovinne)',
        'auth.fields.password_eyeButton.aria': 'Toggle password',
      }

      return translations[key] ?? key
    },
  }),
}))

describe('PasswordField', () => {
  it('renders as password input by default', () => {
    render(<PasswordField label="Password" isRequired />)

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('toggles visibility when eye button is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordField label="Password" isRequired />)

    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Toggle password' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Toggle password' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('renders error message', () => {
    render(<PasswordField label="Password" isRequired errorMessage="Too short" />)

    expect(screen.getByText('Too short')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports value and onChange', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<PasswordField label="Password" isRequired onChange={onChange} />)

    await user.type(screen.getByLabelText('Password'), 'secret')

    expect(onChange).toHaveBeenLastCalledWith('secret')
  })
})

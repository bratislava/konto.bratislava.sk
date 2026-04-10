import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'

import TextField from '../TextField'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'FieldHeader.optional': '(Nepovinne)',
      }

      return translations[key] ?? key
    },
  }),
}))

describe('TextField', () => {
  it('renders label and input', () => {
    render(<TextField label="Email" isRequired />)

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('renders error message and sets aria-invalid', () => {
    render(<TextField label="Email" isRequired errorMessage="This field is required." />)

    expect(screen.getByText('This field is required.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not render error message when undefined', () => {
    render(<TextField label="Email" isRequired />)

    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('renders helptext as description with aria-describedby', () => {
    render(<TextField label="Email" isRequired helptext="Enter your work email" />)

    expect(screen.getByText('Enter your work email')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby')
  })

  it('shows optional label when not required', () => {
    render(<TextField label="Email" displayOptionalLabel />)

    expect(screen.getByText('(Nepovinne)')).toBeInTheDocument()
  })

  it('does not show optional label when required', () => {
    render(<TextField label="Email" isRequired displayOptionalLabel />)

    expect(screen.queryByText('(Nepovinne)')).not.toBeInTheDocument()
  })

  it('shows asterisk when displayOptionalLabel is false and isRequired', () => {
    render(<TextField label="Email" isRequired displayOptionalLabel={false} />)

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('calls onChange with trimmed leading spaces', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<TextField label="Name" isRequired onChange={onChange} />)

    await user.type(screen.getByRole('textbox'), ' hello')

    expect(onChange).toHaveBeenLastCalledWith('hello')
  })

  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>()
    render(<TextField label="Email" isRequired ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(screen.getByRole('textbox'))
  })

  it('renders data-cy attribute from name prop', () => {
    render(<TextField label="Email" isRequired name="email" />)

    expect(screen.getByRole('textbox')).toHaveAttribute('data-cy', 'input-email')
  })

  it('renders helptextFooter', () => {
    render(<TextField label="Email" isRequired helptextFooter="We won't share it" />)

    expect(screen.getByText("We won't share it")).toBeInTheDocument()
  })

  it('renders helptext as ReactNode', () => {
    render(
      <TextField
        label="Email"
        isRequired
        helptext={<span data-testid="custom-help">Custom help</span>}
      />,
    )

    expect(screen.getByTestId('custom-help')).toBeInTheDocument()
  })

  it('renders endIcon', () => {
    render(<TextField label="Search" isRequired endIcon={<span data-testid="icon">X</span>} />)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('passes through RAC props like autoComplete', () => {
    render(<TextField label="Email" isRequired autoComplete="email" />)

    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'email')
  })

  it('renders as disabled', () => {
    render(<TextField label="Email" isRequired isDisabled />)

    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import CheckboxWidgetRJSF from '../CheckboxWidgetRJSF'

jest.mock('../WidgetWrapper', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('../../formatting/FormMarkdown/FormMarkdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => (
    <span data-testid="form-markdown">{children}</span>
  ),
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const makeProps = (overrides: Record<string, unknown> = {}) => ({
  id: 'field-id',
  label: 'Agreement',
  schema: {},
  options: { checkboxLabel: 'I agree to the terms' },
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: null,
  ...overrides,
})

describe('CheckboxWidgetRJSF', () => {
  it('renders checkbox with checkboxLabel', () => {
    render(<CheckboxWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('checkbox', { name: 'I agree to the terms' })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<CheckboxWidgetRJSF {...(makeProps({ rawErrors: ['Required'] }) as any)} />)

    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <CheckboxWidgetRJSF
        {...(makeProps({
          options: { checkboxLabel: 'Accept', helptext: '**terms**', helptextMarkdown: true },
        }) as any)}
      />,
    )

    expect(screen.getByTestId('form-markdown')).toHaveTextContent('**terms**')
  })

  it('calls onChange with true when checked', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<CheckboxWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.click(screen.getByRole('checkbox', { name: 'I agree to the terms' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when unchecked', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<CheckboxWidgetRJSF {...(makeProps({ onChange, value: true }) as any)} />)

    await user.click(screen.getByRole('checkbox', { name: 'I agree to the terms' }))
    expect(onChange).toHaveBeenCalledWith(false)
  })
})

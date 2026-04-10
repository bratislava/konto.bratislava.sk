import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import InputWidgetRJSF from '../InputWidgetRJSF'

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
  label: 'Email',
  options: {},
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: undefined,
  placeholder: undefined,
  name: 'email',
  ...overrides,
})

describe('InputWidgetRJSF', () => {
  it('renders textbox with label', () => {
    render(<InputWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('textbox', { name: /Email/ })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<InputWidgetRJSF {...(makeProps({ rawErrors: ['Required field'] }) as any)} />)

    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <InputWidgetRJSF
        {...(makeProps({ options: { helptext: '**info**', helptextMarkdown: true } }) as any)}
      />,
    )

    expect(screen.getByTestId('form-markdown')).toHaveTextContent('**info**')
  })

  it('calls RJSF onChange with undefined when input is cleared', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<InputWidgetRJSF {...(makeProps({ onChange, value: 'hello' }) as any)} />)

    await user.clear(screen.getByRole('textbox'))
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('calls RJSF onChange with value when typing', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<InputWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.type(screen.getByRole('textbox'), 'test@example.com')
    expect(onChange).toHaveBeenLastCalledWith('test@example.com')
  })
})

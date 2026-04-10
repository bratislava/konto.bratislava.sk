import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import NumberWidgetRJSF from '../NumberWidgetRJSF'

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
  label: 'Amount',
  schema: { type: 'number' },
  options: {},
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: undefined,
  placeholder: undefined,
  name: 'amount',
  ...overrides,
})

describe('NumberWidgetRJSF', () => {
  it('renders number input with label', () => {
    render(<NumberWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('textbox', { name: /Amount/ })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<NumberWidgetRJSF {...(makeProps({ rawErrors: ['Must be positive'] }) as any)} />)

    expect(screen.getByText('Must be positive')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <NumberWidgetRJSF
        {...(makeProps({ options: { helptext: '**tip**', helptextMarkdown: true } }) as any)}
      />,
    )

    expect(screen.getByTestId('form-markdown')).toHaveTextContent('**tip**')
  })

  it('calls RJSF onChange with undefined when field is cleared', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<NumberWidgetRJSF {...(makeProps({ onChange, value: 42 }) as any)} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('calls RJSF onChange with number when value entered', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<NumberWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.type(screen.getByRole('textbox'), '42')
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(42)
  })
})

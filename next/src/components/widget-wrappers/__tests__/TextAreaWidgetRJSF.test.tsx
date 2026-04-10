import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import TextAreaWidgetRJSF from '../TextAreaWidgetRJSF'

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
  label: 'Description',
  options: {},
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: undefined,
  placeholder: undefined,
  ...overrides,
})

describe('TextAreaWidgetRJSF', () => {
  it('renders textarea with label', () => {
    render(<TextAreaWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('textbox', { name: /Description/ })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<TextAreaWidgetRJSF {...(makeProps({ rawErrors: ['Too short'] }) as any)} />)

    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <TextAreaWidgetRJSF
        {...(makeProps({ options: { helptext: '**info**', helptextMarkdown: true } }) as any)}
      />,
    )

    expect(screen.getByTestId('form-markdown')).toHaveTextContent('**info**')
  })

  it('defers onChange to blur via FieldBlurWrapper', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<TextAreaWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.type(screen.getByRole('textbox'), 'hello')
    expect(onChange).not.toHaveBeenCalled()

    await user.tab()
    expect(onChange).toHaveBeenCalledWith('hello')
  })

  it('calls onChange with undefined when textarea is cleared and blurred', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<TextAreaWidgetRJSF {...(makeProps({ onChange, value: 'existing' }) as any)} />)

    await user.clear(screen.getByRole('textbox'))
    await user.tab()
    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})

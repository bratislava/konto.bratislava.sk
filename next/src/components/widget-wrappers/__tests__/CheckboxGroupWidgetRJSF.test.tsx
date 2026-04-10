import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import CheckboxGroupWidgetRJSF from '../CheckboxGroupWidgetRJSF'

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
  label: 'Options',
  schema: {},
  options: {
    enumOptions: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    enumMetadata: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: null,
  ...overrides,
})

describe('CheckboxGroupWidgetRJSF', () => {
  it('renders checkboxes from enumOptions', () => {
    render(<CheckboxGroupWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('checkbox', { name: 'Option 1' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Option 2' })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<CheckboxGroupWidgetRJSF {...(makeProps({ rawErrors: ['Select at least one'] }) as any)} />)

    expect(screen.getByText('Select at least one')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <CheckboxGroupWidgetRJSF
        {...(makeProps({
          options: {
            enumOptions: [],
            enumMetadata: [],
            helptext: '**info**',
            helptextMarkdown: true,
          },
        }) as any)}
      />,
    )

    expect(screen.getByTestId('form-markdown')).toHaveTextContent('**info**')
  })

  it('calls RJSF onChange with selected values array', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<CheckboxGroupWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.click(screen.getByRole('checkbox', { name: 'Option 1' }))
    expect(onChange).toHaveBeenCalledWith(['option1'])
  })
})

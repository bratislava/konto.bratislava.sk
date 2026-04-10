import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import RadioGroupWidgetRJSF from '../RadioGroupWidgetRJSF'

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
  label: 'Color',
  schema: { type: 'string' },
  options: {
    enumOptions: [
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
    ],
    enumMetadata: [
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
    ],
  },
  required: false,
  disabled: false,
  readonly: false,
  rawErrors: [],
  onChange: jest.fn(),
  value: undefined,
  ...overrides,
})

describe('RadioGroupWidgetRJSF', () => {
  it('renders radio options from enumOptions', () => {
    render(<RadioGroupWidgetRJSF {...(makeProps() as any)} />)

    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument()
  })

  it('shows error from rawErrors', () => {
    render(<RadioGroupWidgetRJSF {...(makeProps({ rawErrors: ['Required'] }) as any)} />)

    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders markdown helptext via FormMarkdown', () => {
    render(
      <RadioGroupWidgetRJSF
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

  it('calls RJSF onChange with string value on selection', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(<RadioGroupWidgetRJSF {...(makeProps({ onChange }) as any)} />)

    await user.click(screen.getByRole('radio', { name: 'Blue' }))
    expect(onChange).toHaveBeenCalledWith('blue')
  })

  it('converts string to boolean for boolean schema', async () => {
    const onChange = jest.fn()
    const user = userEvent.setup()
    render(
      <RadioGroupWidgetRJSF
        {...(makeProps({
          schema: { type: 'boolean' },
          onChange,
          options: {
            enumOptions: [
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ],
            enumMetadata: [
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ],
          },
        }) as any)}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Yes' }))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

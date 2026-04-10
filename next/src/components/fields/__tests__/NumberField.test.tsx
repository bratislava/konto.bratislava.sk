import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NumberField from '../NumberField'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('NumberField', () => {
  it('renders label and input', () => {
    render(<NumberField label="Amount" isRequired />)

    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeInTheDocument()
  })

  it('calls onChange with number value', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<NumberField label="Amount" isRequired onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '42')
    await user.tab()

    expect(onChange).toHaveBeenLastCalledWith(42)
  })

  it('calls onChange with NaN when cleared', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<NumberField label="Amount" isRequired value={42} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.tab()

    expect(onChange).toHaveBeenLastCalledWith(NaN)
  })

  it('renders error message', () => {
    render(<NumberField label="Amount" isRequired errorMessage="Must be positive" />)

    expect(screen.getByText('Must be positive')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not render stepper buttons', () => {
    render(<NumberField label="Amount" isRequired />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

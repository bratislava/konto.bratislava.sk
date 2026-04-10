import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Radio from '../Radio'
import RadioGroup from '../RadioGroup'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('RadioGroup', () => {
  it('renders label and radio options', () => {
    render(
      <RadioGroup label="Color" isRequired>
        <Radio value="red">Red</Radio>
        <Radio value="blue">Blue</Radio>
      </RadioGroup>,
    )

    expect(screen.getByText('Color')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeInTheDocument()
  })

  it('selects a radio on click', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <RadioGroup label="Color" isRequired onChange={onChange}>
        <Radio value="red">Red</Radio>
        <Radio value="blue">Blue</Radio>
      </RadioGroup>,
    )

    await user.click(screen.getByRole('radio', { name: 'Blue' }))

    expect(onChange).toHaveBeenCalledWith('blue')
  })

  it('renders error message', () => {
    render(
      <RadioGroup label="Color" isRequired errorMessage="Please select one">
        <Radio value="red">Red</Radio>
      </RadioGroup>,
    )

    expect(screen.getByText('Please select one')).toBeInTheDocument()
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders with vertical orientation by default', () => {
    render(
      <RadioGroup label="Color" isRequired>
        <Radio value="red">Red</Radio>
      </RadioGroup>,
    )

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('supports horizontal orientation', () => {
    render(
      <RadioGroup label="Color" isRequired orientation="horizontal">
        <Radio value="red">Red</Radio>
      </RadioGroup>,
    )

    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('renders radio with description', () => {
    render(
      <RadioGroup label="Plan" isRequired>
        <Radio value="free" description="No cost">
          Free
        </Radio>
      </RadioGroup>,
    )

    expect(screen.getByText('No cost')).toBeInTheDocument()
  })

  it('navigates with keyboard arrows', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <RadioGroup label="Color" isRequired onChange={onChange}>
        <Radio value="red">Red</Radio>
        <Radio value="blue">Blue</Radio>
        <Radio value="green">Green</Radio>
      </RadioGroup>,
    )

    await user.tab()
    await user.keyboard('{ArrowDown}')

    expect(onChange).toHaveBeenCalledWith('blue')
  })
})

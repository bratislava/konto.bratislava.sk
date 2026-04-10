import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Checkbox from '../Checkbox'
import CheckboxGroup from '../CheckboxGroup'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

describe('CheckboxGroup', () => {
  it('renders label and checkbox options', () => {
    render(
      <CheckboxGroup label="Interests" isRequired>
        <Checkbox value="sports">Sports</Checkbox>
        <Checkbox value="music">Music</Checkbox>
      </CheckboxGroup>,
    )

    expect(screen.getByText('Interests')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Sports' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Music' })).toBeInTheDocument()
  })

  it('toggles checkbox on click', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <CheckboxGroup label="Interests" isRequired onChange={onChange}>
        <Checkbox value="sports">Sports</Checkbox>
        <Checkbox value="music">Music</Checkbox>
      </CheckboxGroup>,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Sports' }))

    expect(onChange).toHaveBeenCalledWith(['sports'])
  })

  it('supports multiple selections', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <CheckboxGroup label="Interests" isRequired value={['sports']} onChange={onChange}>
        <Checkbox value="sports">Sports</Checkbox>
        <Checkbox value="music">Music</Checkbox>
      </CheckboxGroup>,
    )

    await user.click(screen.getByRole('checkbox', { name: 'Music' }))

    expect(onChange).toHaveBeenCalledWith(['sports', 'music'])
  })

  it('renders error message', () => {
    render(
      <CheckboxGroup label="Interests" isRequired errorMessage="Select at least one">
        <Checkbox value="sports">Sports</Checkbox>
      </CheckboxGroup>,
    )

    expect(screen.getByText('Select at least one')).toBeInTheDocument()
  })

  it('toggles with Space key', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <CheckboxGroup label="Interests" isRequired onChange={onChange}>
        <Checkbox value="sports">Sports</Checkbox>
      </CheckboxGroup>,
    )

    await user.tab()
    await user.keyboard(' ')

    expect(onChange).toHaveBeenCalledWith(['sports'])
  })
})

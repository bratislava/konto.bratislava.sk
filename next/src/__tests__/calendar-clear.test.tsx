import { describe, expect, it, jest } from '@jest/globals'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { parseDate } from '@internationalized/date'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nProvider } from 'react-aria'
import { DatePicker as RACDatePicker } from 'react-aria-components'

import ClearButton from '@/src/components/fields/DatePicker/ClearButton'

describe('Calendar clear button (V9)', () => {
  it('calls setValue(null) via DatePickerStateContext', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(
      <I18nProvider locale="sk-SK">
        <RACDatePicker
          aria-label="date"
          defaultValue={parseDate('2024-03-15')}
          onChange={onChange}
        >
          <ClearButton />
        </RACDatePicker>
      </I18nProvider>,
    )

    const clearButton = screen.getByRole('button', { name: 'DatePicker.clear' })
    await user.click(clearButton)

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('renders nothing outside DatePicker context', () => {
    const { container } = render(
      <I18nProvider locale="sk-SK">
        <ClearButton />
      </I18nProvider>,
    )
    expect(container.firstChild).toBeNull()
  })
})

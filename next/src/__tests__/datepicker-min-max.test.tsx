import { describe, expect, it, jest } from '@jest/globals'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { parseDate } from '@internationalized/date'
import { render } from '@testing-library/react'
import { I18nProvider } from 'react-aria'
import {
  Calendar as RACCalendar,
  CalendarCell as RACCalendarCell,
  CalendarGrid as RACCalendarGrid,
} from 'react-aria-components'

import { safeParseDate, safeParseTime } from '@/src/components/widget-wrappers/dateTimeParse'

// V10: min/max on uiOption string → RAC value → RAC disables out-of-range cells.

describe('min/max propagation (V10)', () => {
  it('safeParseDate of uiOption string yields CalendarDate usable as minValue', () => {
    const minValue = safeParseDate('2024-03-10')
    expect(minValue?.toString()).toBe('2024-03-10')
  })

  it('RACCalendar disables cell before minValue', () => {
    const { container } = render(
      <I18nProvider locale="sk-SK">
        <RACCalendar
          aria-label="cal"
          focusedValue={parseDate('2024-03-15')}
          minValue={parseDate('2024-03-10')}
        >
          <RACCalendarGrid>
            {(date) => <RACCalendarCell date={date} data-date={date.toString()} />}
          </RACCalendarGrid>
        </RACCalendar>
      </I18nProvider>,
    )
    const cellBefore = container.querySelector('[data-date="2024-03-05"]')
    expect(cellBefore).not.toBeNull()
    expect(cellBefore?.getAttribute('data-disabled')).toBe('true')
  })

  it('RACCalendar disables cell after maxValue', () => {
    const { container } = render(
      <I18nProvider locale="sk-SK">
        <RACCalendar
          aria-label="cal"
          focusedValue={parseDate('2024-03-15')}
          maxValue={parseDate('2024-03-20')}
        >
          <RACCalendarGrid>
            {(date) => <RACCalendarCell date={date} data-date={date.toString()} />}
          </RACCalendarGrid>
        </RACCalendar>
      </I18nProvider>,
    )
    const cellAfter = container.querySelector('[data-date="2024-03-25"]')
    expect(cellAfter).not.toBeNull()
    expect(cellAfter?.getAttribute('data-disabled')).toBe('true')
  })

  it('safeParseTime of uiOption string yields Time usable as minValue', () => {
    const minValue = safeParseTime('09:00')
    expect(minValue?.toString()).toBe('09:00:00')
  })
})

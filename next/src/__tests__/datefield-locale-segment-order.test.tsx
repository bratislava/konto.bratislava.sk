import { describe, expect, it, jest } from '@jest/globals'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { render } from '@testing-library/react'
import { I18nProvider } from 'react-aria'

import DateField from '@/src/components/fields/DateField'

const getSegmentTypes = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll('[data-type]'))
    .map((el) => el.getAttribute('data-type'))
    .filter((t): t is string => t !== null && t !== 'literal')

describe('DateField segment order per locale (V13)', () => {
  it('renders day-month-year order under sk-SK', () => {
    const { container } = render(
      <I18nProvider locale="sk-SK">
        <DateField label="Dátum" aria-label="date" />
      </I18nProvider>,
    )
    expect(getSegmentTypes(container)).toEqual(['day', 'month', 'year'])
  })

  it('renders month-day-year order under en-US', () => {
    const { container } = render(
      <I18nProvider locale="en-US">
        <DateField label="Date" aria-label="date" />
      </I18nProvider>,
    )
    expect(getSegmentTypes(container)).toEqual(['month', 'day', 'year'])
  })
})

// tax.spec.ts
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { checkTaxDateInclusion } from '../tax.helper'

dayjs.extend(utc)
dayjs.extend(timezone)

describe('checkTaxDateInclusion', () => {
  it.each([
    { position: 'within', currentTime: '2024-08-15', expected: true },
    { position: 'before', currentTime: '2024-08-09', expected: false },
    { position: 'after', currentTime: '2024-08-21', expected: false },
  ])(
    'should return $expected for shouldAddCurrentYear when current time is $position the date range',
    ({ currentTime, expected }) => {
      const mockCurrentTime = dayjs.tz(currentTime, 'Europe/Bratislava')

      const result = checkTaxDateInclusion(mockCurrentTime, {
        from: { month: 8, day: 10 },
        to: { month: 8, day: 20 },
      })

      expect(result).toBe(expected)
    },
  )
})

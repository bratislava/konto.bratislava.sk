// tax.spec.ts
import { checkTaxDateInclusion } from '../tax.helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

describe('checkTaxDateInclusion', () => {
  it('should return true for shouldAddCurrentYear when current time is within the date range', () => {
    const mockCurrentTime = dayjs.tz('2024-08-15', 'Europe/Bratislava')

    const result = checkTaxDateInclusion(mockCurrentTime, {
      from: { month: 8, day: 10 },
      to: { month: 8, day: 20 },
    })

    expect(result).toBe(true)
  })

  it('should return false for shouldAddCurrentYear when current time is before the date range', () => {
    const mockCurrentTime = dayjs.tz('2024-08-09', 'Europe/Bratislava')

    const result = checkTaxDateInclusion(mockCurrentTime, {
      from: { month: 8, day: 10 },
      to: { month: 8, day: 20 },
    })

    expect(result).toBe(false)
  })

  it('should return false for shouldAddCurrentYear when current time is after the date range', () => {
    const mockCurrentTime = dayjs.tz('2024-08-21', 'Europe/Bratislava')

    const result = checkTaxDateInclusion(mockCurrentTime, {
      from: { month: 8, day: 10 },
      to: { month: 8, day: 20 },
    })

    expect(result).toBe(false)
  })
})

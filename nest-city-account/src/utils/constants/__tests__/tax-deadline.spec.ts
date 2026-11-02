import type { MockedFunction } from 'vitest'

import getBaConfigInstance from '../../../config/ba-config.instance'
import { toDate } from '../../functions/temporal'
import { getTaxDeadlineDate } from '../tax-deadline'

vi.mock('../../../config/ba-config.instance')

const TIMEZONE = 'Europe/Bratislava'

const dateInTimeZone = (fields: Temporal.DateTimeLikeObject, timeZone: string) =>
  toDate(Temporal.ZonedDateTime.from({ ...fields, timeZone }))

const mockGetBaConfigInstance = getBaConfigInstance as MockedFunction<typeof getBaConfigInstance>

const mockTaxDeadline = (config: { month: number; day: number }) => {
  mockGetBaConfigInstance.mockReturnValue({ taxDeadline: config } as ReturnType<
    typeof getBaConfigInstance
  >)
}

describe('tax-deadline', () => {
  describe('each date to 1st of April should be before deadline, each date from it should be after', () => {
    beforeEach(() => {
      mockTaxDeadline({ month: 4, day: 1 })
    })

    const { year } = Temporal.Now.zonedDateTimeISO(TIMEZONE)
    const afterDeadline = [
      dateInTimeZone(
        {
          year,
          month: 4,
          day: 1,
          hour: 0,
          minute: 0,
          second: 10,
        },
        TIMEZONE
      ),
      dateInTimeZone(
        {
          year,
          month: 4,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
        },
        TIMEZONE
      ),
      dateInTimeZone(
        {
          year,
          month: 4,
          day: 1,
          hour: 10,
          minute: 0,
          second: 0,
        },
        TIMEZONE
      ),
      dateInTimeZone({ year, month: 12, day: 10, hour: 13, minute: 22, second: 0 }, TIMEZONE),
    ]
    const beforeDeadline = [
      dateInTimeZone({ year, month: 3, day: 31, hour: 0, minute: 0, second: 10 }, TIMEZONE),
      dateInTimeZone({ year, month: 3, day: 31, hour: 23, minute: 59, second: 59 }, TIMEZONE),
      dateInTimeZone({ year, month: 1, day: 4, hour: 10, minute: 0, second: 0 }, TIMEZONE),
    ]
    afterDeadline.forEach((date) => {
      it(`${date.toISOString()} should be after deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(false)
      })
    })
    beforeDeadline.forEach((date) => {
      it(`${date.toISOString()} should be before deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(true)
      })
    })
  })

  describe('when deadline is 1st of February, each date to 1st of February should be before deadline, each date from it should be after', () => {
    beforeEach(() => {
      mockTaxDeadline({ month: 2, day: 1 })
    })

    const { year } = Temporal.Now.zonedDateTimeISO(TIMEZONE)
    const afterDeadline = [
      dateInTimeZone(
        {
          year,
          month: 2,
          day: 1,
          hour: 0,
          minute: 0,
          second: 10,
        },
        TIMEZONE
      ),
      dateInTimeZone(
        {
          year,
          month: 2,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
        },
        TIMEZONE
      ),
      dateInTimeZone(
        {
          year,
          month: 2,
          day: 1,
          hour: 10,
          minute: 0,
          second: 0,
        },
        TIMEZONE
      ),
      dateInTimeZone({ year, month: 12, day: 10, hour: 13, minute: 22, second: 0 }, TIMEZONE),
      dateInTimeZone({ year, month: 2, day: 1, hour: 0, minute: 0, second: 1 }, 'America/New_York'),
    ]
    const beforeDeadline = [
      dateInTimeZone({ year, month: 1, day: 31, hour: 0, minute: 0, second: 10 }, TIMEZONE),
      dateInTimeZone({ year, month: 1, day: 31, hour: 23, minute: 59, second: 59 }, TIMEZONE),
      dateInTimeZone({ year, month: 1, day: 2, hour: 10, minute: 0, second: 0 }, TIMEZONE),
      dateInTimeZone({ year, month: 2, day: 1, hour: 0, minute: 0, second: 1 }, 'Asia/Tokyo'),
    ]
    afterDeadline.forEach((date) => {
      it(`${date.toISOString()} should be after deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(false)
      })
    })
    beforeDeadline.forEach((date) => {
      it(`${date.toISOString()} should be before deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(true)
      })
    })
  })
})

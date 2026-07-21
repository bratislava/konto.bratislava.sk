import { DateTime } from 'luxon'

import getBaConfigInstance from '../../../config/ba-config.instance'
import { getTaxDeadlineDate } from '../tax-deadline'

jest.mock('../../../config/ba-config.instance')

const TIMEZONE = 'Europe/Bratislava'

const mockGetBaConfigInstance = getBaConfigInstance as jest.MockedFunction<
  typeof getBaConfigInstance
>

const mockTaxDeadline = (config: { month: number; day: number }) => {
  mockGetBaConfigInstance.mockReturnValue({ taxDeadline: config } as ReturnType<
    typeof getBaConfigInstance
  >)
}

describe('tax-deadline', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('each date to 1st of April should be before deadline, each date from it should be after', () => {
    beforeEach(() => {
      mockTaxDeadline({ month: 4, day: 1 })
    })

    const year = DateTime.now().setZone(TIMEZONE).year
    const afterDeadline = [
      DateTime.fromObject(
        {
          year,
          month: 4,
          day: 1,
          hour: 0,
          minute: 0,
          second: 10,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        {
          year,
          month: 4,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        {
          year,
          month: 4,
          day: 1,
          hour: 10,
          minute: 0,
          second: 0,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 12, day: 10, hour: 13, minute: 22, second: 0 },
        { zone: TIMEZONE }
      ).toJSDate(),
    ]
    const beforeDeadline = [
      DateTime.fromObject(
        { year, month: 3, day: 31, hour: 0, minute: 0, second: 10 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 3, day: 31, hour: 23, minute: 59, second: 59 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 1, day: 4, hour: 10, minute: 0, second: 0 },
        { zone: TIMEZONE }
      ).toJSDate(),
    ]
    afterDeadline.forEach((date) => {
      it(`${date} should be after deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(false)
      })
    })
    beforeDeadline.forEach((date) => {
      it(`${date} should be before deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(true)
      })
    })
  })

  describe('when deadline is 1st of February, each date to 1st of February should be before deadline, each date from it should be after', () => {
    beforeEach(() => {
      mockTaxDeadline({ month: 2, day: 1 })
    })

    const year = DateTime.now().setZone(TIMEZONE).year
    const afterDeadline = [
      DateTime.fromObject(
        {
          year,
          month: 2,
          day: 1,
          hour: 0,
          minute: 0,
          second: 10,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        {
          year,
          month: 2,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        {
          year,
          month: 2,
          day: 1,
          hour: 10,
          minute: 0,
          second: 0,
        },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 12, day: 10, hour: 13, minute: 22, second: 0 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 2, day: 1, hour: 0, minute: 0, second: 1 },
        { zone: 'America/New_York' }
      ).toJSDate(),
    ]
    const beforeDeadline = [
      DateTime.fromObject(
        { year, month: 1, day: 31, hour: 0, minute: 0, second: 10 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 1, day: 31, hour: 23, minute: 59, second: 59 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 1, day: 2, hour: 10, minute: 0, second: 0 },
        { zone: TIMEZONE }
      ).toJSDate(),
      DateTime.fromObject(
        { year, month: 2, day: 1, hour: 0, minute: 0, second: 1 },
        { zone: 'Asia/Tokyo' }
      ).toJSDate(),
    ]
    afterDeadline.forEach((date) => {
      it(`${date} should be after deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(false)
      })
    })
    beforeDeadline.forEach((date) => {
      it(`${date} should be before deadline`, () => {
        expect(date < getTaxDeadlineDate()).toBe(true)
      })
    })
  })
})

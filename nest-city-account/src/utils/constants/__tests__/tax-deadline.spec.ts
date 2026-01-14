import { getTaxDeadlineDate } from '../tax-deadline'

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    getOrThrow: jest.fn((key: string) => {
      if (key === 'MUNICIPAL_TAX_LOCK_MONTH') return '04'
      if (key === 'MUNICIPAL_TAX_LOCK_DAY') return '01'
      throw new Error(`Unknown config key: ${key}`)
    }),
  })),
}))

describe('tax-deadline', () => {
  describe('each date to 1st of April should be before deadline, each date from it should be after', () => {
    const year = new Date().getFullYear()
    const afterDeadline = [
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 00:00:10+02:00`
      ),
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 00:00:00+02:00`
      ),
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 10:00:00+02:00`
      ),
      new Date(`${year}-12-10 13:22:00+02:00`),
    ]
    const beforeDeadline = [
      new Date(`${year}-03-31 00:00:10+02:00`),
      new Date(`${year}-03-31 23:59:59+02:00`),
      new Date(`${year}-01-04 10:00:00+02:00`),
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
    jest.mock('@nestjs/config', () => ({
      ConfigService: jest.fn().mockImplementation(() => ({
        getOrThrow: jest.fn((key: string) => {
          if (key === 'MUNICIPAL_TAX_LOCK_MONTH') return '02'
          if (key === 'MUNICIPAL_TAX_LOCK_DAY') return '01'
          throw new Error(`Unknown config key: ${key}`)
        }),
      })),
    }))

    const year = new Date().getFullYear()
    const afterDeadline = [
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 00:00:10+02:00`
      ),
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 00:00:00+02:00`
      ),
      new Date(
        `${year}-${process.env.MUNICIPAL_TAX_LOCK_MONTH}-${process.env.MUNICIPAL_TAX_LOCK_DAY} 10:00:00+02:00`
      ),
      new Date(`${year}-12-10 13:22:00+02:00`),
    ]
    const beforeDeadline = [
      new Date(`${year}-01-31 00:00:10+02:00`),
      new Date(`${year}-01-31 23:59:59+02:00`),
      new Date(`${year}-02-01 10:00:00+02:00`),
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

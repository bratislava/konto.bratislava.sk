import { getTaxDeadlineDateString } from '../tax-deadline'

describe('tax-deadline', () => {
  it('should return the correct tax deadline for the given year', () => {
    const year = new Date().getFullYear()
    expect(getTaxDeadlineDateString()).toBe(`${year}-03-02 00:00:00`)
  })

  it('each date from 1st of March should be before deadline, each date from 2nd should be after', () => {
    const year = new Date().getFullYear()
    const afterDeadline = [
      new Date(`${year}-03-02 00:00:10`),
      new Date(`${year}-03-02 00:00:00`),
      new Date(`${year}-03-03 10:00:00`),
    ]
    const beforeDeadline = [
      new Date(`${year}-03-01 00:00:10`),
      new Date(`${year}-03-01 23:59:59`),
      new Date(`${year}-02-03 10:00:00`),
    ]
    afterDeadline.forEach((date) => {
      expect(date < new Date(getTaxDeadlineDateString())).toBe(false)
    })
    beforeDeadline.forEach((date) => {
      expect(date < new Date(getTaxDeadlineDateString())).toBe(true)
    })
  })
})

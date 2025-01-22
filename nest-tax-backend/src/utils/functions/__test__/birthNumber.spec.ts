import { addSlashToBirthNumber } from '../birthNumber'

describe('addSlashToBirthNumber', () => {
  it('should add slash to birth number', () => {
    expect(addSlashToBirthNumber('1234567890')).toBe('123456/7890')
  })

  it('should not add slash to birth number that already contains it', () => {
    expect(addSlashToBirthNumber('123456/7890')).toBe('123456/7890')
  })

  it('should work on birth number with length 9', () => {
    expect(addSlashToBirthNumber('123456789')).toBe('123456/789')
  })
})

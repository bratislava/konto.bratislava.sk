import { addSlashToBirthNumber } from '../birthNumber'

// eslint-disable-next-line no-secrets/no-secrets
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

  it('should throw if the format is wrong', () => {
    expect(() => addSlashToBirthNumber('12345678901')).toThrow()
    expect(() => addSlashToBirthNumber('abcdef')).toThrow()
    expect(() => addSlashToBirthNumber('123456/11a')).toThrow()
    expect(() => addSlashToBirthNumber('12345611a')).toThrow()
    expect(() => addSlashToBirthNumber('123456/11')).toThrow()
    expect(() => addSlashToBirthNumber('12456/1155')).toThrow()
    expect(() => addSlashToBirthNumber('12345611')).toThrow()
  })
})

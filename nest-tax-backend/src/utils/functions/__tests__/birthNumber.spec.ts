import { ErrorEnum } from '@bratislava/log-nest'
import { HttpStatus } from '@nestjs/common'

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

  it.each([
    ['12345678901', 'XXXXXXXXXXX'],
    ['abcdef', 'AAAAAA'],
    ['123456/11a', 'XXXXXX/XXA'],
    ['12345611a', 'XXXXXXXXA'],
    ['123456/11', 'XXXXXX/XX'],
    ['12456/1155', 'XXXXX/XXXX'],
    ['12345611', 'XXXXXXXX'],
  ])(
    'should throw if the format is wrong (%s), logging only the anonymized birth number',
    (invalidBirthNumber, anonymizedBirthNumber) => {
      expect(() =>
        addSlashToBirthNumber(invalidBirthNumber),
      ).toThrowEqualLogNestError({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
        message: 'Invalid birth number passed to addSlashToBirthNumber',
        console: { anonymizedBirthNumber },
        alert: true,
      })
    },
  )
})

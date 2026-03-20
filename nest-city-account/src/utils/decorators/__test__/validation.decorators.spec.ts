import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { IsBirthNumber, IsIco, IsIdentityCard } from '../validation.decorators'

/** Known-valid samples for `rodnecislo` / Slovak birth number (see rodnecislo checksum rules). */
const VALID_BIRTH_NUMBERS = ['8501011002', '0608217753', '376027017']

describe('IsBirthNumber', () => {
  class BirthNumberDto {
    @IsBirthNumber()
    birthNumber!: string
  }

  VALID_BIRTH_NUMBERS.forEach((birthNumber) => {
    it(`accepts a valid birth number ${birthNumber}`, async () => {
      const dto = plainToInstance(BirthNumberDto, { birthNumber })
      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })

  it('rejects a valid birth number with a slash', async () => {
    const birthNumber = '711219/7499'
    const dto = plainToInstance(BirthNumberDto, { birthNumber })
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('birthNumber')
    expect(errors[0].constraints).toMatchObject(
      expect.objectContaining({
        isBirthNumber: expect.any(String),
      })
    )

    const birthNumberWithoutSlash = birthNumber.replace('/', '')
    const dtoWithoutSlash = plainToInstance(BirthNumberDto, { birthNumber: birthNumberWithoutSlash })
    const errorsWithoutSlash = await validate(dtoWithoutSlash)
    expect(errorsWithoutSlash).toHaveLength(0)
  })

  it('rejects a syntactically numeric but invalid birth number', async () => {
    const dto = plainToInstance(BirthNumberDto, { birthNumber: '8501011003' })
    const errors = await validate(dto)
    expect(errors).toHaveLength(1)
    expect(errors[0].property).toBe('birthNumber')
    expect(errors[0].constraints).toMatchObject(
      expect.objectContaining({
        isBirthNumber: expect.any(String),
      })
    )
  })

  it('rejects non-string values', async () => {
    const dto = plainToInstance(BirthNumberDto, { birthNumber: 8501011002 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects strings with non-digits', async () => {
    const dto = plainToInstance(BirthNumberDto, { birthNumber: '850101100a' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects empty string (fails underlying validity check)', async () => {
    const dto = plainToInstance(BirthNumberDto, { birthNumber: '' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('IsIdentityCard', () => {
  class IdentityCardDto {
    @IsIdentityCard()
    idCard!: string
  }

  it('accepts 8 characters: two letters + six digits', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: 'AB123456' })
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('accepts 9 characters when letters + six digits slice still matches', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: 'AB1234567' })
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('rejects wrong length', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: 'AB12345' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects missing letter prefix', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: 'A1123456' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects non-digit middle segment', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: 'AB12X456' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects non-string', async () => {
    const dto = plainToInstance(IdentityCardDto, { idCard: null })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('IsIco', () => {
  class IcoDto {
    @IsIco()
    ico!: string
  }

  it.each(['123456', '1234567', '12345678'])('accepts %s (6-8 digits)', async (ico) => {
    const dto = plainToInstance(IcoDto, { ico })
    const errors = await validate(dto)
    expect(errors).toHaveLength(0)
  })

  it('rejects too short', async () => {
    const dto = plainToInstance(IcoDto, { ico: '12345' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects too long', async () => {
    const dto = plainToInstance(IcoDto, { ico: '123456789' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects non-digits', async () => {
    const dto = plainToInstance(IcoDto, { ico: '12345a' })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('rejects non-string', async () => {
    const dto = plainToInstance(IcoDto, { ico: 123456 })
    const errors = await validate(dto)
    expect(errors.length).toBeGreaterThan(0)
  })
})

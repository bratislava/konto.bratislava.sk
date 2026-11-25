import { rodnecislo } from 'rodnecislo'

import {
  generateBirthNumber,
  generateInvalidBirthNumber,
} from '../birth-number'

const SAMPLE_SIZE = 1000

describe('birth number fixtures', () => {
  it('should generate unique valid 10-digit birth numbers', () => {
    const birthNumbers = Array.from({ length: SAMPLE_SIZE }, () =>
      generateBirthNumber(),
    )

    expect(
      birthNumbers.filter(
        (birthNumber) =>
          !/^\d{10}$/.test(birthNumber) || !rodnecislo(birthNumber).isValid(),
      ),
    ).toEqual([])
    expect(new Set(birthNumbers).size).toBe(SAMPLE_SIZE)
  })

  it('should generate unique invalid birth numbers', () => {
    const birthNumbers = Array.from({ length: SAMPLE_SIZE }, () =>
      generateInvalidBirthNumber(),
    )

    expect(
      birthNumbers.filter((birthNumber) => rodnecislo(birthNumber).isValid()),
    ).toEqual([])
    expect(new Set(birthNumbers).size).toBe(SAMPLE_SIZE)
  })
})

import { randomInt } from 'node:crypto'

/** Birth numbers have the 10-digit format with a check digit since 1954. */
const FIRST_BIRTH_YEAR = 1954
const LAST_BIRTH_YEAR = 2005
const MONTHS_IN_YEAR = 12
const YEAR_DIGITS_MODULO = 100
const SERIAL_NUMBER_LIMIT = 1000
const SERIAL_NUMBER_LENGTH = 3
const CHECKSUM_MODULO = 11
const DECIMAL_BASE = 10

const generatedBirthNumbers = new Set<string>()

function generateUniqueBirthNumber(validChecksum: boolean): string {
  let birthNumber: string
  let checkDigit: number
  do {
    const year = randomInt(FIRST_BIRTH_YEAR, LAST_BIRTH_YEAR + 1)
    const month = randomInt(1, MONTHS_IN_YEAR + 1)
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const day = randomInt(1, daysInMonth + 1)

    birthNumber = [year % YEAR_DIGITS_MODULO, month, day]
      .map((part) => part.toString().padStart(2, '0'))
      .concat(
        randomInt(SERIAL_NUMBER_LIMIT)
          .toString()
          .padStart(SERIAL_NUMBER_LENGTH, '0'),
      )
      .join('')
    checkDigit =
      (CHECKSUM_MODULO -
        ((Number(birthNumber) * DECIMAL_BASE) % CHECKSUM_MODULO)) %
      CHECKSUM_MODULO
    // A check digit of 10 cannot be written, generate again
  } while (
    checkDigit === DECIMAL_BASE ||
    generatedBirthNumbers.has(birthNumber)
  )

  generatedBirthNumbers.add(birthNumber)
  // A different last digit changes the remainder by 1 to 9, so the number is not divisible by 11
  return `${birthNumber}${validChecksum ? checkDigit : (checkDigit + 1) % DECIMAL_BASE}`
}

export function generateBirthNumber(): string {
  return generateUniqueBirthNumber(true)
}

export function generateInvalidBirthNumber(): string {
  return generateUniqueBirthNumber(false)
}

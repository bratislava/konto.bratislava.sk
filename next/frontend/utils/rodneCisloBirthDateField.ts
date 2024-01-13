import { rodnecislo } from 'rodnecislo'

export enum RodneCisloValidationErrorReason {
  WithoutDelimiter = 'rodneCisloWithoutDelimiter',
  CorrectFormatInvalid = 'rodneCisloCorrectFormatInvalid',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-redundant-type-constituents
export function validateRodneCislo(value: string | any) {
  if (typeof value !== 'string') {
    return false
  }
  const result = rodnecislo(value)
  if (result.isValid()) {
    return true
  }
  if (/^\d+$/.test(value)) {
    return RodneCisloValidationErrorReason.WithoutDelimiter
  }
  if (/^\d{6}\/\d{3,4}$/.test(value)) {
    return RodneCisloValidationErrorReason.CorrectFormatInvalid
  }
  return false
}

export enum DateErrorValidationReason {
  NonExistent = 'dateNonExistent',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-redundant-type-constituents
export function validateDDMMYYDate(value: string | any) {
  // Regular expression to match the date format DD.MM.YYYY
  const regex = /^(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(\d{4})$/

  if (typeof value !== 'string') {
    return false
  }
  // Check if the input matches the pattern
  const match = value.match(regex)

  // If the pattern does not match, the date is invalid
  if (!match) {
    return false
  }

  // Extract the day, month, and year from the input
  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1 // Month is 0-indexed in JavaScript Date
  const year = parseInt(match[3], 10)

  // Create a Date object with the extracted values
  const date = new Date(year, month, day)

  // Check if the Date object represents the same day, month, and year
  // This check is necessary to catch cases like 31st of February
  const isValidDate =
    date.getDate() === day && date.getMonth() === month && date.getFullYear() === year
  if (!isValidDate) {
    return DateErrorValidationReason.NonExistent
  }

  return true
}

import { rodnecislo } from 'rodnecislo'

/**
 * `rodnecislo` also accepts the Czech +20 / +70 month offsets (used since 2004),
 * which are not used in Slovak birth numbers. Valid months are 01–12 (men) and 51–62 (women).
 */
const hasValidSlovakMonth = (birthNumber: string): boolean => {
  const month = Number(birthNumber.substring(2, 4))
  return (month >= 1 && month <= 12) || (month >= 51 && month <= 62)
}

export const isValidBirthNumber = (birthNumber: string): boolean => {
  const rc = rodnecislo(birthNumber)
  return rc.isValid() && hasValidSlovakMonth(birthNumber)
}

import { rodnecislo } from 'rodnecislo'

const hasValidSlovakMonth = (birthNumber: string): boolean => {
  const month = Number(birthNumber.substring(2, 4))
  return (month >= 1 && month <= 12) || (month >= 51 && month <= 62)
}

export const isValidBirthNumber = (birthNumber: string): boolean => {
  const rc = rodnecislo(birthNumber)
  return rc.isValid() && hasValidSlovakMonth(birthNumber)
}

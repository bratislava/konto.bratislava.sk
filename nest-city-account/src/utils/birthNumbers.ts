import { rodnecislo } from 'rodnecislo'

export const isValidBirthNumber = (birthNumber: string): boolean => {
  const rc = rodnecislo(birthNumber)
  return rc.isValid()
}

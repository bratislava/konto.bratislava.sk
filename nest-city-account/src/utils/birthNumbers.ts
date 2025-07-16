import { rodnecislo } from 'rodnecislo'

export const isValidBirthNumber = (birthNumber: string): boolean => {
  const rc = rodnecislo(birthNumber)
  return rc.isValid()
}

export const addSlashToBirthNumber = (birthNumber: string): string => {
  if (birthNumber.includes('/')) {
    return birthNumber
  }

  return `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}

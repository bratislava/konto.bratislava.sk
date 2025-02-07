import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'

export function addSlashToBirthNumber(birthNumber: string): string {
  const birthNumberRegex = /^\d{6}\/?\d{3,4}$/
  if (!birthNumberRegex.test(birthNumber)) {
    const thrower = new ThrowerErrorGuard()
    throw thrower.InternalServerErrorException(
      ErrorsEnum.INTERNAL_SERVER_ERROR,
      `Invalid birth number passed to addSlashToBirthNumber: "${birthNumber}"`,
    )
  }
  return birthNumber.includes('/')
    ? birthNumber
    : `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}

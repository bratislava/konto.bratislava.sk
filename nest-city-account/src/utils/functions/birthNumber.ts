import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'

export function addSlashToBirthNumber(birthNumber: string): string {
  const birthNumberRegex = /^\d{6}\/?\d{3,4}$/
  if (!birthNumberRegex.test(birthNumber)) {
    const errorFactoryService = new ErrorFactoryService()
    throw errorFactoryService.InternalServerErrorException({
      errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
      message: `Invalid birth number passed to addSlashToBirthNumber ${birthNumber}`,
    })
  }
  return birthNumber.includes('/')
    ? birthNumber
    : `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}

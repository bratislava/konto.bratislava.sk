import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'

import alertReporting from '../constants/error.alerts'

export function addSlashToBirthNumber(birthNumber: string): string {
  const birthNumberRegex = /^\d{6}\/?\d{3,4}$/
  if (!birthNumberRegex.test(birthNumber)) {
    const errorFactoryService = new ErrorFactoryService({ alertReporting })
    throw errorFactoryService.InternalServerErrorException({
      errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
      message: 'Invalid birth number passed to addSlashToBirthNumber',
      console: `anonymized invalid birthnumber: '${birthNumber.replaceAll(/\d/g, 'X')}'`,
    })
  }
  return birthNumber.includes('/')
    ? birthNumber
    : `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}

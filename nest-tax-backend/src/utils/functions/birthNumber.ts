import { ErrorEnum, ErrorFactoryService } from '@bratislava/log-nest'

import alertReporting from '../constants/error.alerts'

/**
 * @param logContext - non-PII ids (e.g. externalId, taxPayerId) logged if the birth number is invalid
 */
export function addSlashToBirthNumber(
  birthNumber: string,
  logContext?: Record<string, unknown>,
): string {
  const birthNumberRegex = /^\d{6}\/?\d{3,4}$/
  if (!birthNumberRegex.test(birthNumber)) {
    const errorFactoryService = new ErrorFactoryService({ alertReporting })
    throw errorFactoryService.InternalServerErrorException({
      errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
      message: `Invalid birth number passed to addSlashToBirthNumber`,
      console: {
        ...logContext,
        // only the shape is kept: digits -> X, letters -> A
        anonymizedBirthNumber: birthNumber
          .replaceAll(/\p{L}/gu, 'A')
          .replaceAll(/\d/g, 'X'),
      },
    })
  }
  return birthNumber.includes('/')
    ? birthNumber
    : `${birthNumber.slice(0, 6)}/${birthNumber.slice(6)}`
}

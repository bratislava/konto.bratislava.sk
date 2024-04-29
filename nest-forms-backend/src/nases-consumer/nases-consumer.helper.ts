import { Injectable, Logger } from '@nestjs/common'
import { Files, FormError } from '@prisma/client'

import {
  finalErrorScanStatuses,
  infectedScanStatuses,
} from '../common/utils/helpers'
import PrismaService from '../prisma/prisma.service'
import alertError from '../utils/logging'

@Injectable()
export default class NasesConsumerHelper {
  private readonly logger: Logger

  constructor(private prisma: PrismaService) {
    this.logger = new Logger('NasesConsumerHelper')
  }

  async checkInfectedFiles(formId: string): Promise<boolean> {
    const infectedFiles: Array<Files> = await this.prisma.files.findMany({
      where: {
        formId,
        status: {
          in: infectedScanStatuses,
        },
      },
    })

    if (infectedFiles.length > 0) {
      // here we should send notification to user and to our notification service
      this.logger.warn({
        type: 'Form contains infected files.',
        formId,
        error: FormError.INFECTED_FILES,
        infectedFiles,
      })
      return true
    }
    return false
  }

  async checkErrorFiles(formId: string): Promise<boolean> {
    const errorFiles: Array<Files> = await this.prisma.files.findMany({
      where: {
        formId,
        status: {
          in: finalErrorScanStatuses,
        },
      },
    })

    if (errorFiles.length > 0) {
      // here we should send notification to user and to our notification service
      alertError(
        'There was an error with files scanning service.',
        this.logger,
        JSON.stringify({
          type: 'There was an error with files scanning service.',
          formId,
          error: FormError.UNABLE_TO_SCAN_FILES,
          errorFiles,
        }),
      )
      return false
    }
    return false
  }
}

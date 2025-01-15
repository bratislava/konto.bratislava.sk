import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Forms, FormState } from '@prisma/client'

import PrismaService from '../../prisma/prisma.service'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import alertError, {
  LineLoggerSubservice,
} from '../../utils/subservices/line-logger.subservice'
import {
  GinisTaskErrorEnum,
  GinisTaskErrorResponseEnum,
} from '../errors/ginis-tasks.errors.enum'
import GinisAPIService from './ginis-api.service'

const GINIS_PROCESSING_DOCUMENT_STATES = new Set(['podano', 'nevyrizen'])
const GINIS_ACCEPTED_DOCUMENT_STATES = new Set(['vyrizen', 'uzavren'])
const GINIS_REJECTED_DOCUMENT_STATES = new Set([
  'stornovan',
  'ztracen',
  'zastaven',
])

const BATCH_LIMIT = 50

@Injectable()
export default class GinisTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly ginisApiService: GinisAPIService,
  ) {
    this.logger = new LineLoggerSubservice('GinisTasksSubservice')
  }

  private async updateSubmissionState(submission: Forms): Promise<void> {
    if (submission.ginisDocumentId === null) return

    let docDetail
    try {
      docDetail = await this.ginisApiService.getDocumentDetail(
        submission.ginisDocumentId,
      )
    } catch (error) {
      alertError(
        GinisTaskErrorEnum.GET_DOCUMENT_DETAIL_ERROR,
        this.logger,
        `${GinisTaskErrorResponseEnum.GET_DOCUMENT_DETAIL_ERROR} Document ID: ${submission.ginisDocumentId}.`,
      )
      return
    }

    const docState = docDetail.WflDokument[0].StavDokumentu

    if (GINIS_ACCEPTED_DOCUMENT_STATES.has(docState)) {
      await this.prisma.forms.update({
        where: {
          id: submission.id,
        },
        data: {
          state: FormState.FINISHED,
        },
      })
    } else if (GINIS_REJECTED_DOCUMENT_STATES.has(docState)) {
      await this.prisma.forms.update({
        where: {
          id: submission.id,
        },
        data: {
          state: FormState.REJECTED,
        },
      })
    } else if (!GINIS_PROCESSING_DOCUMENT_STATES.has(docState)) {
      alertError(
        `Unknown GINIS Document state received: ${docState} for submission ${submission.ginisDocumentId}.`,
        this.logger,
      )
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('GinisTasksCron')
  async checkSubmissionState(): Promise<void> {
    const submissions = await this.prisma.forms.findMany({
      where: {
        state: FormState.PROCESSING,
        ginisDocumentId: { not: null },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: BATCH_LIMIT,
    })

    await Promise.all(
      submissions.map((submission) => this.updateSubmissionState(submission)),
    )
  }
}

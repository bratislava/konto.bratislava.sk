import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Forms, FormState } from '@prisma/client'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'

import PrismaService from '../../prisma/prisma.service'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import {
  GinisTaskErrorEnum,
  GinisTaskErrorResponseEnum,
} from '../errors/ginis-tasks.errors.enum'
import GinisHelper from './ginis.helper'
import GinisAPIService from './ginis-api.service'

const GINIS_PROCESSING_DOCUMENT_STATES = new Set(['podano', 'nevyrizen'])
const GINIS_ACCEPTED_DOCUMENT_STATES = new Set(['vyrizen', 'uzavren'])
const GINIS_REJECTED_DOCUMENT_STATES = new Set([
  'stornovan',
  'ztracen',
  'zastaven',
])

@Injectable()
export default class GinisTasksSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly prisma: PrismaService,
    private readonly ginisHelper: GinisHelper,
    private readonly ginisApiService: GinisAPIService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('GinisTasksSubservice')
  }

  private async updateSubmissionState(submission: Forms): Promise<void> {
    const { ginisDocumentId } = submission
    if (ginisDocumentId === null) return

    let docState: string
    try {
      // sometimes ginis times-out on the first try
      docState = await this.ginisHelper.retryWithDelay(async () => {
        const docDetail =
          await this.ginisApiService.getDocumentDetail(ginisDocumentId)

        return docDetail['Wfl-dokument']['Stav-dokumentu']
      })
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          GinisTaskErrorEnum.GET_DOCUMENT_DETAIL_ERROR,
          GinisTaskErrorResponseEnum.GET_DOCUMENT_DETAIL_ERROR,
          { ginisDocumentId },
          error,
        ),
      )
      return
    }

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
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          GinisTaskErrorEnum.GET_DOCUMENT_DETAIL_ERROR,
          'Unknown GINIS Document state received.',
          { docState, ginisDocumentId },
        ),
      )
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  @HandleErrors('GinisTasksCron')
  async checkSubmissionState(): Promise<void> {
    // check every document only once a week, otherwise it's a large daily load and Ginis thinks its DOS attack
    // day of the week when a form is checked depends on which symbol the form id starts with
    const dayToHexPrefixes: Record<number, string[]> = {
      1: ['0', '1'], // Monday
      2: ['2', '3'], // Tuesday
      3: ['4', '5'], // Wednesday
      4: ['6', '7'], // Thursday
      5: ['8', '9'], // Friday
      6: ['a', 'b', 'c'], // Saturday
      0: ['d', 'e', 'f'], // Sunday
    }
    const today = new Date().getDay()
    const prefixes = dayToHexPrefixes[today] ?? []
    if (!prefixes) {
      return
    }

    const slugsToProcess = formDefinitions
      // eslint-disable-next-line unicorn/no-array-callback-reference
      .filter(isSlovenskoSkFormDefinition)
      .filter((formDefinition) => !formDefinition.skipGinisStateUpdate)
      .map(({ slug }) => slug)

    const submissions = await this.prisma.forms.findMany({
      where: {
        OR: prefixes.map((prefix) => ({ id: { startsWith: prefix } })),
        state: FormState.PROCESSING,
        ginisDocumentId: { not: null },
        archived: false,
        formDefinitionSlug: { in: slugsToProcess },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    await Promise.allSettled(
      submissions.map((submission) => this.updateSubmissionState(submission)),
    )
  }
}

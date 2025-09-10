import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { isAxiosError } from 'axios'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import { isSlovenskoSkFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'

import ClientsService from '../../clients/clients.service'
import BaConfigService from '../../config/ba-config.service'
import { ClusterEnv } from '../../config/environment-variables'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError, {
  LineLoggerSubservice,
} from '../../utils/subservices/line-logger.subservice'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from '../nases.errors.enum'
import NasesUtilsService from './tokens.nases.service'

type ValidateFormRegistrationsResult = Record<
  'not-found' | 'not-published' | 'error',
  {
    pospID: string
    pospVersion: string
  }[]
>

@Injectable()
export default class NasesCronSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly clientsService: ClientsService,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService,
  ) {
    this.logger = new LineLoggerSubservice('NasesCronSubservice')
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @HandleErrors('CronError')
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async validateFormRegistrations(): Promise<void> {
    const result: ValidateFormRegistrationsResult = {
      'not-found': [],
      'not-published': [],
      error: [],
    }
    let successfulForms = 0

    await Promise.all(
      formDefinitions.map(async (formDefinition) => {
        if (!isSlovenskoSkFormDefinition(formDefinition)) {
          return
        }

        if (
          this.baConfigService.environment.clusterEnv ===
            ClusterEnv.Production &&
          formDefinition.doesNotHaveToBeRegisteredInProduction
        ) {
          return
        }

        const validateEformJwtToken =
          this.nasesUtilsService.createTechnicalAccountJwtToken()

        const { pospID, pospVersion } = formDefinition

        try {
          const validated =
            await this.clientsService.slovenskoSkApi.apiEformStatusGet(
              pospID,
              pospVersion,
              {
                headers: {
                  Authorization: `Bearer ${validateEformJwtToken}`,
                },
              },
            )
          // eslint-disable-next-line unicorn/no-negated-condition
          if (validated.data.status !== 'Publikovaný') {
            result['not-published'].push({
              pospID,
              pospVersion,
            })
          } else {
            successfulForms += 1
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            result['not-found'].push({
              pospID,
              pospVersion,
            })
          } else {
            result.error.push({
              pospID,
              pospVersion,
            })
            this.logger.error(
              this.throwerErrorGuard.InternalServerErrorException(
                NasesErrorsEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
                NasesErrorsResponseEnum.FAILED_FORM_REGISTRATION_VERIFICATION,
                undefined,
                error,
              ),
            )
          }
        }
      }),
    )

    if (
      result['not-found'].length > 0 ||
      result['not-published'].length > 0 ||
      result.error.length > 0
    ) {
      alertError(
        `Form definitions with Slovensko.sk registration issues: ${JSON.stringify(result)}`,
        this.logger,
      )
    } else {
      this.logger.log(
        `All ${successfulForms} Slovensko.sk form registrations are valid.`,
      )
    }
  }
}

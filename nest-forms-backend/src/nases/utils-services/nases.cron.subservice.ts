import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { isAxiosError } from 'axios'
import { formDefinitions } from 'forms-shared/definitions/formDefinitions'
import {
  FormDefinitionSlovenskoSk,
  isSlovenskoSkFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'

import ClientsService from '../../clients/clients.service'
import BaConfigService from '../../config/ba-config.service'
import { ClusterEnv } from '../../config/environment-variables'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError, {
  LineLoggerSubservice,
} from '../../utils/subservices/line-logger.subservice'
import { ValidateFormRegistrationsResultDto } from '../dtos/responses.dto'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from '../nases.errors.enum'
import FormRegistrationStatusRepository from './form-registration-status.repository'
import NasesUtilsService from './tokens.nases.service'

enum FormRegistrationStatus {
  PUBLISHED = 'Publikovaný',
}

@Injectable()
export default class NasesCronSubservice {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly clientsService: ClientsService,
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService,
    private readonly formRegistrationStatusRepository: FormRegistrationStatusRepository,
  ) {
    this.logger = new LineLoggerSubservice('NasesCronSubservice')
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @HandleErrors('CronError')
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async validateFormRegistrations(): Promise<ValidateFormRegistrationsResultDto> {
    const result: ValidateFormRegistrationsResultDto = {
      'not-found': [],
      'not-published': [],
      error: [],
      valid: [],
    }

    const addToResult = async (
      key: keyof ValidateFormRegistrationsResultDto,
      formDefinition: FormDefinitionSlovenskoSk,
      isRegistered: boolean,
    ) => {
      const { pospID, pospVersion, slug } = formDefinition
      result[key].push({ slug, pospID, pospVersion })
      await this.formRegistrationStatusRepository.setStatus(
        formDefinition,
        isRegistered,
      )
    }

    await Promise.all(
      formDefinitions.map(async (formDefinition) => {
        if (!isSlovenskoSkFormDefinition(formDefinition)) {
          return
        }

        if (
          this.baConfigService.environment.clusterEnv ===
            ClusterEnv.Production &&
          formDefinition.skipProductionRegistrationCheck
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
          await (validated.data.status !== FormRegistrationStatus.PUBLISHED
            ? addToResult('not-published', formDefinition, false)
            : addToResult('valid', formDefinition, true))
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            await addToResult('not-found', formDefinition, false)
          } else {
            await addToResult('error', formDefinition, false)
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
        `Some form definitions are not correctly registered in slovensko.sk. Result of validation: ${JSON.stringify(result)}`,
        this.logger,
      )
    } else {
      this.logger.log(
        `All ${result.valid.length} Slovensko.sk form registrations are valid. Valid forms: ${JSON.stringify(result.valid)}`,
      )
    }

    return result
  }
}

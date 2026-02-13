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
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
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

    /**
     * Add form definition to result object and optionally update its registration status in the database.
     *
     * @param key - The key in the result object to which the form definition should be added.
     * @param formDefinition - The form definition to be added.
     * @param isRegistered - Optional boolean indicating if the form is registered; if provided, updates the registration status in the database.
     * @returns A promise that resolves when the operation is complete.
     */
    const addToResult = async (
      key: keyof ValidateFormRegistrationsResultDto,
      formDefinition: FormDefinitionSlovenskoSk,
      isRegistered?: boolean,
    ) => {
      const { pospID, pospVersion, slug } = formDefinition
      result[key].push({ slug, pospID, pospVersion })

      if (isRegistered === undefined) {
        return
      }
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
          await (validated.data.status === FormRegistrationStatus.PUBLISHED
            ? addToResult('valid', formDefinition, true)
            : addToResult('not-published', formDefinition, false))
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            await addToResult('not-found', formDefinition, false)
          } else {
            await addToResult('error', formDefinition)
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
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.FORM_DEFINITION_NOT_IN_SLOVENSKO_SK,
          'Some form definitions are not correctly registered in slovensko.sk.',
          { validationResult: result },
        ),
      )
    } else {
      this.logger.log(
        `All ${result.valid.length} Slovensko.sk form registrations are valid. Valid forms: ${JSON.stringify(result.valid)}`,
      )
    }

    return result
  }
}

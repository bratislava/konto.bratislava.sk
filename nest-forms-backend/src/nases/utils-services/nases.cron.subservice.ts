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
import PrismaService from '../../prisma/prisma.service'
import HandleErrors from '../../utils/decorators/errorHandler.decorators'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError, {
  LineLoggerSubservice,
} from '../../utils/subservices/line-logger.subservice'
import { NasesErrorsEnum, NasesErrorsResponseEnum } from '../nases.errors.enum'
import NasesUtilsService from './tokens.nases.service'

type ValidateFormRegistrationsResult = Record<
  'not-found' | 'not-published' | 'error' | 'valid',
  {
    pospID: string
    pospVersion: string
  }[]
>

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
    private readonly prismaService: PrismaService,
  ) {
    this.logger = new LineLoggerSubservice('NasesCronSubservice')
  }

  private async saveRegistrationStateToDatabase(
    formDefinition: FormDefinitionSlovenskoSk,
    isRegistered: boolean,
  ): Promise<void> {
    await this.prismaService.formRegistrationStatus.upsert({
      where: {
        slug_pospId_pospVersion: {
          slug: formDefinition.slug,
          pospId: formDefinition.pospID,
          pospVersion: formDefinition.pospVersion,
        },
      },
      create: {
        slug: formDefinition.slug,
        pospId: formDefinition.pospID,
        pospVersion: formDefinition.pospVersion,
        isRegistered,
      },
      update: {
        isRegistered,
      },
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @HandleErrors('CronError')
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async validateFormRegistrations(): Promise<void> {
    const result: ValidateFormRegistrationsResult = {
      'not-found': [],
      'not-published': [],
      error: [],
      valid: [],
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
          if (validated.data.status !== FormRegistrationStatus.PUBLISHED) {
            result['not-published'].push({
              pospID,
              pospVersion,
            })
            await this.saveRegistrationStateToDatabase(formDefinition, false)
          } else {
            result.valid.push({
              pospID,
              pospVersion,
            })
            await this.saveRegistrationStateToDatabase(formDefinition, true)
          }
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 404) {
            result['not-found'].push({
              pospID,
              pospVersion,
            })
            await this.saveRegistrationStateToDatabase(formDefinition, false)
          } else {
            result.error.push({
              pospID,
              pospVersion,
            })
            await this.saveRegistrationStateToDatabase(formDefinition, false)
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
  }
}

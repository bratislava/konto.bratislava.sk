import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import axios from 'axios'
import { isWebhookFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'

import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import { getFileIdsToInfoMap } from '../../utils/files'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import alertError from '../../utils/logging'
import WebhookDto from './dtos/webhook.dto'
import {
  WebhookErrorsEnum,
  WebhookErrorsResponseEnum,
} from './dtos/webhook.errors.enum'

@Injectable()
export default class WebhookSubservice {
  private logger: Logger = new Logger(WebhookSubservice.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
  ) {}

  async sendWebhook(formId: string): Promise<void> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: formId,
      },
      include: {
        files: true,
      },
    })
    if (form === null) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      )
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }

    if (!isWebhookFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        WebhookErrorsEnum.NOT_WEBHOOK_FORM,
        `${WebhookErrorsResponseEnum.NOT_WEBHOOK_FORM} Form id: ${form.id}.`,
      )
    }

    // prepare file urls into the resulting json
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET')
    const selfUrl = this.configService.getOrThrow<string>('SELF_URL')
    const fileIdInfoMap = getFileIdsToInfoMap(form, jwtSecret, selfUrl)

    const formData = omitExtraData(
      formDefinition.schemas.schema,
      form.formDataJson as GenericObjectType,
      this.formValidatorRegistryService.getRegistry(),
    )

    this.logger.log(
      `Sending webhook form ${formId} to ${formDefinition.webhookUrl}`,
    )

    const webhookDto: WebhookDto = {
      formId: form.id,
      slug: form.formDefinitionSlug,
      // TODO: Get version from form definition
      jsonVersion: '1.0',
      data: formData,
      files: fileIdInfoMap,
    }
    await axios.post(formDefinition.webhookUrl, webhookDto)

    try {
      await this.prismaService.forms.update({
        where: {
          id: formId,
        },
        data: {
          state: FormState.FINISHED,
        },
      })
    } catch (error) {
      alertError(
        `Setting form state with id ${formId} to FINISHED failed.`,
        this.logger,
        JSON.stringify(error),
      )
    }
  }
}

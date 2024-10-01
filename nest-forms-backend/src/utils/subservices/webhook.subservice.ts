import { Injectable, Logger } from '@nestjs/common'
import { FormState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import axios from 'axios'
import { isWebhookFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { omitExtraData } from 'forms-shared/form-utils/omitExtraData'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import alertError from '../logging'
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
  ) {}

  async sendWebhook(formId: string): Promise<void> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: formId,
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
    this.logger.log(
      `Sending webhook form ${formId} to ${formDefinition.webhookUrl}`,
    )

    const webhookDto: WebhookDto = {
      formData: omitExtraData(
        formDefinition.schemas.schema,
        form.formDataJson as GenericObjectType,
      ),
    }
    await axios.post(formDefinition.webhookUrl, webhookDto)

    try {
      await this.prismaService.forms.update({
        where: {
          id: formId,
        },
        data: {
          state: FormState.PROCESSING,
        },
      })
    } catch (error) {
      alertError(
        `Setting form state with id ${formId} to PROCESSING failed.`,
        this.logger,
        JSON.stringify(error),
      )
    }
  }
}

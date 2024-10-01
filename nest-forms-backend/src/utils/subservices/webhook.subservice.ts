import { Process, Processor } from '@nestjs/bull'
import { Injectable, Logger } from '@nestjs/common'
import { Job } from 'bull'
import { isWebhookFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import PrismaService from '../../prisma/prisma.service'
import ThrowerErrorGuard from '../guards/thrower-error.guard'
import {
  WebhookErrorsEnum,
  WebhookErrorsResponseEnum,
} from './dtos/webhook.errors.enum'

@Injectable()
@Processor('webhook.send')
export default class WebhookSubservice {
  private logger: Logger = new Logger(WebhookSubservice.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {}

  @Process()
  async sendWebhook(job: Job<{ formId: string }>): Promise<void> {
    const form = await this.prismaService.forms.findUnique({
      where: {
        id: job.data.formId,
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
      `Sending webhook form ${job.data.formId} to ${formDefinition.webhookUrl}`,
    )

    // TODO axios?
  }
}

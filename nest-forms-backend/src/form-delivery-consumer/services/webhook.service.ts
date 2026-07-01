import { Injectable } from '@nestjs/common'
import axios, { isAxiosError } from 'axios'
import { isWebhookFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { baOmitExtraData } from 'forms-shared/form-utils/omitExtraData'

import BaConfigService from '../../config/ba-config.service'
import FormValidatorRegistryService from '../../form-validator-registry/form-validator-registry.service'
import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../../forms/forms.errors.enum'
import { FormState } from '../../generated/prisma/client'
import PrismaService from '../../prisma/prisma.service'
import { getFileIdsToInfoMap } from '../../utils/files'
import { ErrorsEnum } from '../../utils/global-enums/errors.enum'
import ThrowerErrorGuard from '../../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import WebhookDto from '../dtos/webhook.dto'
import {
  WebhookErrorsEnum,
  WebhookErrorsResponseEnum,
} from '../errors/webhook.errors.enum'

@Injectable()
export default class WebhookService {
  private logger: LineLoggerSubservice = new LineLoggerSubservice(
    WebhookService.name,
  )

  constructor(
    private readonly prismaService: PrismaService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService,
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
        WebhookErrorsResponseEnum.NOT_WEBHOOK_FORM,
        { formId: form.id },
      )
    }

    // prepare file urls into the resulting json
    const jwtSecret = this.baConfigService.tokens.jwtSecret
    const selfUrl = this.baConfigService.self.url
    const fileIdInfoMap = getFileIdsToInfoMap(form, jwtSecret, selfUrl)

    if (form.formDataJson == null) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.EMPTY_FORM_DATA,
        FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      )
    }

    const formData = baOmitExtraData(
      formDefinition.schema,
      form.formDataJson,
      this.formValidatorRegistryService.getRegistry(),
    )

    this.logger.log(
      `Sending webhook form ${formId} to ${formDefinition.webhookUrl}`,
    )

    const webhookDto: WebhookDto = {
      formId: form.id,
      jsonVersion: form.jsonVersion,
      slug: form.formDefinitionSlug,
      data: formData,
      files: fileIdInfoMap,
    }
    try {
      await axios.post(formDefinition.webhookUrl, webhookDto)
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          this.throwerErrorGuard.fromAxiosError(error, {
            console: { formId },
          }),
        )
        return
      }

      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Sending webhook for form failed`,
          { formId },
          error,
        ),
      )
      return
    }

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
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Setting form state to FINISHED failed`,
          { formId },
          error,
        ),
      )
    }
  }
}

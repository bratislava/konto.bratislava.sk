import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerSubservice,
} from '@bratislava/log-nest'
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
import WebhookDto from '../dtos/webhook.dto'
import {
  WebhookErrorsEnum,
  WebhookErrorsResponseEnum,
} from '../errors/webhook.errors.enum'

@Injectable()
export default class WebhookService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly baConfigService: BaConfigService,
    private readonly formValidatorRegistryService: FormValidatorRegistryService,
    private readonly logger: LineLoggerSubservice,
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
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_NOT_FOUND_ERROR,
        message: FormsErrorsResponseEnum.FORM_NOT_FOUND_ERROR,
      })
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        message: `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      })
    }

    if (!isWebhookFormDefinition(formDefinition)) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: WebhookErrorsEnum.NOT_WEBHOOK_FORM,
        message: WebhookErrorsResponseEnum.NOT_WEBHOOK_FORM,
        console: { formId: form.id },
      })
    }

    // prepare file urls into the resulting json
    const jwtSecret = this.baConfigService.tokens.jwtSecret
    const selfUrl = this.baConfigService.self.url
    const fileIdInfoMap = getFileIdsToInfoMap(form, jwtSecret, selfUrl)

    if (form.formDataJson == null) {
      throw this.errorFactoryService.UnprocessableEntityException({
        errorEnum: FormsErrorsEnum.EMPTY_FORM_DATA,
        message: FormsErrorsResponseEnum.EMPTY_FORM_DATA,
      })
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
          this.errorFactoryService.fromAxiosError(error, {
            console: { formId },
          }),
        )
        return
      }

      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Sending webhook for form failed`,
          console: { formId },
          error,
        }),
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
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Setting form state to FINISHED failed`,
          console: { formId },
          error,
        }),
      )
    }
  }
}

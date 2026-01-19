import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { FormError, Forms, FormState } from '@prisma/client'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionSlovenskoSkGeneric,
  FormDefinitionType,
  isSlovenskoSkGenericFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'

import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import FormsService from '../forms/forms.service'
import GinisService from '../ginis/ginis.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { RABBIT_MQ } from '../utils/constants'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import rabbitmqRequeueDelay from '../utils/handlers/rabbitmq.handlers'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import {
  RabbitPayloadDto,
  RabbitPayloadUserDataDto,
} from './nases-consumer.dto'
import EmailFormsSubservice from './subservices/email-forms.subservice'
import WebhookSubservice from './subservices/webhook.subservice'
import {
  NasesErrorsEnum,
  NasesErrorsResponseEnum,
} from '../nases/nases.errors.enum'

@Injectable()
export default class NasesConsumerService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly rabbitmqClientService: RabbitmqClientService,
    private readonly formsService: FormsService,
    private readonly mailgunService: MailgunService,
    private readonly emailFormsSubservice: EmailFormsSubservice,
    private readonly webhookSubservice: WebhookSubservice,
    private readonly prismaService: PrismaService,
    private readonly ginisService: GinisService,
    private readonly convertPdfService: ConvertPdfService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.logger = new LineLoggerSubservice('NasesConsumerService')
  }

  async nackTrueWithWait(seconds: number): Promise<Nack> {
    await setTimeout(seconds)
    return new Nack(true)
  }

  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_MQ.ROUTING_KEY,
    queue: RABBIT_MQ.QUEUE,
    errorHandler: (channel, msg, error) => {
      const logger = new LineLoggerSubservice('NasesConsumerService')
      const throwerErrorGuard = new ThrowerErrorGuard()

      logger.error(
        throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Error during NasesConsumerService handling',
          error.message,
          error,
        ),
      )
      channel.reject(msg, false)
    },
  })
  public async onQueueConsumption(data: RabbitPayloadDto): Promise<Nack> {
    this.logger.debug(
      `Consuming message for formId: ${data.formId} on try: ${data.tries}`,
    )

    const form = await this.formsService.getUniqueForm(data.formId)
    if (form === null) {
      this.logger.error(
        this.throwerErrorGuard.BadRequestException(
          NasesErrorsEnum.FORM_NOT_FOUND,
          NasesErrorsResponseEnum.FORM_NOT_FOUND,
          { formId: data.formId },
        ),
      )
      return new Nack(false)
    }

    if (form.archived) {
      this.logger.error(
        this.throwerErrorGuard.BadRequestException(
          NasesErrorsEnum.FORM_ARCHIVED,
          NasesErrorsResponseEnum.FORM_ARCHIVED,
          { formId: data.formId },
        ),
      )
      return new Nack(false)
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.FORM_DEFINITION_NOT_FOUND,
          NasesErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND,
          { formDefinitionSug: form.formDefinitionSlug },
        ),
      )
      return new Nack(false)
    }

    if (formDefinition.type === FormDefinitionType.Email) {
      const emailResult = await this.handleEmailForm(
        form,
        data.userData.email,
        data.userData.firstName,
      )
      return emailResult
    }

    if (formDefinition.type === FormDefinitionType.Webhook) {
      const webhookResult = await this.handleWebhookForm(form)
      return webhookResult
    }

    // this filters out tax forms, as they should always be sent with eID and never fall under the nases-consumer queue
    if (!isSlovenskoSkGenericFormDefinition(formDefinition)) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
          NasesErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
          { formId: form.id },
        ),
      )
      return new Nack(false)
    }

    const result = await this.handleSlovenskoSkGenericForm(
      form,
      data,
      formDefinition,
    )
    return result
  }

  private async sendFormSubmissionEmail(
    form: Forms,
    formDefinition: FormDefinitionSlovenskoSk,
    emailSettings: {
      template: MailgunTemplateEnum
      to: string
      firstName: string | null
    },
  ): Promise<void> {
    const { template, to, firstName } = emailSettings
    await this.mailgunService.sendEmail({
      data: {
        to,
        template,
        data: {
          formId: form.id,
          messageSubject: extractFormSubjectPlain(
            formDefinition,
            form.formDataJson,
          ),
          firstName,
          slug: form.formDefinitionSlug,
        },
      },
    })
  }

  private async handleSlovenskoSkGenericForm(
    form: Forms,
    data: RabbitPayloadDto,
    formDefinition: FormDefinitionSlovenskoSkGeneric,
  ): Promise<Nack> {
    try {
      // create a pdf image of the form, upload it to minio and at it among form files
      await this.convertPdfService.createPdfImageInFormFiles(
        data.formId,
        formDefinition,
      )

      await this.ginisService.createDocument(form, formDefinition)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Error during slovensko.sk form handling',
          undefined,
          error,
        ),
      )
      if (data.tries <= 2) {
        const toEmail = data.userData.email || form.email
        if (data.tries === 2 && toEmail) {
          await this.sendFormSubmissionEmail(form, formDefinition, {
            template: MailgunTemplateEnum.NASES_GINIS_IN_PROGRESS,
            to: toEmail,
            firstName: data.userData.firstName,
          })
        }
        await this.queueDelayedForm(
          data.formId,
          data.tries,
          FormError.GINIS_SEND_ERROR,
          data.userData,
          FormState.QUEUED,
        )
        return new Nack(false)
      }
      const requeueFinal = await this.nackTrueWithWait(60_000)
      return requeueFinal
    }

    // If this throws, the flow breaks and requires manual intervention
    await this.rabbitmqClientService.publishToGinis({
      formId: data.formId,
      tries: 0,
      userData: data.userData,
    })

    const toEmail = data.userData.email || form.email
    if (toEmail) {
      await this.sendFormSubmissionEmail(form, formDefinition, {
        template: MailgunTemplateEnum.NASES_SENT,
        to: toEmail,
        firstName: data.userData.firstName,
      })
    }
    return new Nack(false)
  }

  private async queueDelayedForm(
    formId: string,
    tries: number,
    error: FormError,
    userData: RabbitPayloadUserDataDto,
    state: FormState = FormState.QUEUED,
  ): Promise<void> {
    const newTries = tries + 1
    const delay = rabbitmqRequeueDelay(newTries)
    this.logger.debug(
      `Trying to requeue message for formId: ${formId} with delay: ${delay.toString()} for next try: ${newTries} form state: ${state} with error: ${error}`,
    )
    if (delay) {
      await this.formsService.updateForm(formId, {
        state,
        error,
      })
      await this.rabbitmqClientService.publishDelay(
        {
          formId,
          tries: newTries,
          userData,
        },
        delay,
      )
    } else {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.MAX_TRIES_REACHED,
          NasesErrorsResponseEnum.MAX_TRIES_REACHED,
          {
            formId,
            lastErrorState: error,
            nextErrorState: FormState.ERROR,
            error: FormError.RABBITMQ_MAX_TRIES,
          },
        ),
      )
      await this.formsService.updateForm(formId, {
        state: FormState.ERROR,
        error: FormError.RABBITMQ_MAX_TRIES,
      })
    }
  }

  private async handleEmailForm(
    form: Forms,
    userEmail: string | null,
    userFirstName: string | null,
  ): Promise<Nack> {
    try {
      await this.emailFormsSubservice.sendEmailForm(
        form.id,
        userEmail,
        userFirstName,
      )
      return new Nack(false)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.SENDING_EMAIL_FAILED,
          NasesErrorsResponseEnum.SENDING_EMAIL_FAILED,
          { formId: form.id },
          error,
        ),
      )

      await this.prismaService.forms
        .update({
          where: {
            id: form.id,
          },
          data: {
            error: FormError.EMAIL_SEND_ERROR,
          },
        })
        .catch((error_) => {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              NasesErrorsEnum.DATABASE_ERROR,
              'Setting form error to EMAIL_SEND_ERROR failed.',
              { formId: form.id },
              error_,
            ),
          )
        })
      const requeueEmail = await this.nackTrueWithWait(20_000)
      return requeueEmail
    }
  }

  private async handleWebhookForm(form: Forms): Promise<Nack> {
    try {
      await this.webhookSubservice.sendWebhook(form.id)
      return new Nack(false)
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          NasesErrorsEnum.WEBHOOK_ERROR,
          NasesErrorsResponseEnum.WEBHOOK_ERROR,
          { formId: form.id },
          error,
        ),
      )

      await this.prismaService.forms
        .update({
          where: {
            id: form.id,
          },
          data: {
            error: FormError.WEBHOOK_SEND_ERROR,
          },
        })
        .catch((error_) => {
          this.logger.error(
            this.throwerErrorGuard.InternalServerErrorException(
              NasesErrorsEnum.DATABASE_ERROR,
              `Setting form error to WEBHOOK_SEND_ERROR failed.`,
              { formId: form.id },
              error_,
            ),
          )
        })
      const requeueEmail = await this.nackTrueWithWait(20_000)
      return requeueEmail
    }
  }
}

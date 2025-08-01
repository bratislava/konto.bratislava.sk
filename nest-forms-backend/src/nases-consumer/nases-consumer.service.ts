import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { FormError, Forms, FormState } from '@prisma/client'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import {
  FormDefinitionSlovenskoSk,
  FormDefinitionType,
  isSlovenskoSkFormDefinition,
  isSlovenskoSkGenericFormDefinition,
} from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import { extractFormSubjectPlain } from 'forms-shared/form-utils/formDataExtractors'

import ConvertPdfService from '../convert-pdf/convert-pdf.service'
import { FormUpdateBodyDto } from '../forms/dtos/forms.requests.dto'
import { FormsErrorsResponseEnum } from '../forms/forms.errors.enum'
import FormsService from '../forms/forms.service'
import {
  SendMessageNasesSender,
  SendMessageNasesSenderType,
} from '../nases/types/send-message-nases-sender.type'
import NasesUtilsService from '../nases/utils-services/tokens.nases.service'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import { RABBIT_MQ } from '../utils/constants'
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import rabbitmqRequeueDelay from '../utils/handlers/rabbitmq.handlers'
import alertError, {
  LineLoggerSubservice,
} from '../utils/subservices/line-logger.subservice'
import {
  RabbitPayloadDto,
  RabbitPayloadUserDataDto,
} from './nases-consumer.dto'
import EmailFormsSubservice from './subservices/email-forms.subservice'
import WebhookSubservice from './subservices/webhook.subservice'

@Injectable()
export default class NasesConsumerService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly nasesUtilsService: NasesUtilsService,
    private readonly rabbitmqClientService: RabbitmqClientService,
    private readonly formsService: FormsService,
    private readonly mailgunService: MailgunService,
    private readonly convertPdfService: ConvertPdfService,
    private readonly emailFormsSubservice: EmailFormsSubservice,
    private readonly webhookSubservice: WebhookSubservice,
    private readonly prismaService: PrismaService,
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
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async onQueueConsumption(data: RabbitPayloadDto): Promise<Nack> {
    this.logger.debug(
      `Consuming message for formId: ${data.formId} on try: ${data.tries}`,
    )

    const form = await this.formsService.getUniqueForm(data.formId)
    if (form === null) {
      alertError(
        `ERROR onQueueConsumption: NotFoundException - Form with id ${data.formId} not found.`,
        this.logger,
      )
      return new Nack(false)
    }

    if (form.archived) {
      alertError(
        `ERROR onQueueConsumption: NotFoundException - Form with id ${data.formId} is archived.`,
        this.logger,
      )
      return new Nack(false)
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      alertError(
        `ERROR onQueueConsumption: NotFoundException - ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}.`,
        this.logger,
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

    if (!isSlovenskoSkFormDefinition(formDefinition)) {
      alertError(
        `ERROR onQueueConsumption: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE} In the nases-consumer queue only Slovensko.sk forms can be sent to Nases. Form id: ${form.id}.`,
        this.logger,
      )
      return new Nack(false)
    }

    const result = await this.handleSlovenskoSkForm(form, data, formDefinition)
    return result
  }

  private async handleSlovenskoSkForm(
    form: Forms,
    data: RabbitPayloadDto,
    formDefinition: FormDefinitionSlovenskoSk,
  ): Promise<Nack> {
    const jwt = this.nasesUtilsService.createTechnicalAccountJwtToken()
    const isSent = await this.sendToNasesAndUpdateState(
      jwt,
      form,
      data,
      formDefinition,
      { type: SendMessageNasesSenderType.Self },
    )
    if (isSent) {
      const toEmail = data.userData.email || form.email
      if (toEmail) {
        await this.mailgunService.sendEmail({
          data: {
            to: toEmail,
            template: MailgunTemplateEnum.NASES_SENT,
            data: {
              formId: form.id,
              messageSubject: extractFormSubjectPlain(
                formDefinition,
                form.formDataJson,
              ),
              firstName: data.userData.firstName,
              slug: form.formDefinitionSlug,
            },
          },
        })
      }
      return new Nack(false)
    }
    if (data.tries <= 1) {
      const toEmail = data.userData.email || form.email
      if (data.tries === 1 && toEmail) {
        await this.mailgunService.sendEmail({
          data: {
            to: toEmail,
            template: MailgunTemplateEnum.NASES_GINIS_IN_PROGRESS,
            data: {
              formId: form.id,
              messageSubject: extractFormSubjectPlain(
                formDefinition,
                form.formDataJson,
              ),
              firstName: data.userData.firstName,
              slug: form.formDefinitionSlug,
            },
          },
        })
      }
      await this.queueDelayedForm(
        data.formId,
        data.tries,
        FormError.NASES_SEND_ERROR,
        data.userData,
        FormState.QUEUED,
      )
      return new Nack(false)
    }
    const requeueFinal = await this.nackTrueWithWait(60_000)
    return requeueFinal
  }

  public async sendToNasesAndUpdateState(
    jwt: string,
    form: Forms,
    data: RabbitPayloadDto,
    formDefinition: FormDefinitionSlovenskoSk,
    sender: SendMessageNasesSender,
    additionalFormUpdates?: FormUpdateBodyDto,
  ): Promise<boolean> {
    // TODO find a nicer place to do this
    // create a pdf image of the form, upload it to minio and at it among form files
    await this.convertPdfService.createPdfImageInFormFiles(
      data.formId,
      formDefinition,
    )

    const sendData = await this.nasesUtilsService.sendMessageNases(
      jwt,
      form,
      sender,
    )

    if ((sendData && sendData.status !== 200) || !sendData) {
      alertError(
        `Unable send form ${form.id} to nases`,
        this.logger,
        JSON.stringify({
          type: 'Unable send form to nases',
          status: sendData.status,
          formId: data.formId,
          error: FormError.NASES_SEND_ERROR,
          sendData: sendData.data,
        }),
      )
      return false
    }
    // prisma update form status to DELIVERED_NASES
    await this.formsService.updateForm(data.formId, {
      state: FormState.DELIVERED_NASES,
      error: FormError.NONE,
      ...additionalFormUpdates,
    })

    // Send the form to ginis if should be sent
    if (isSlovenskoSkGenericFormDefinition(formDefinition)) {
      // TODO if this throws, the flow breaks and requires manual intervention
      await this.rabbitmqClientService.publishToGinis({
        formId: data.formId,
        tries: 0,
        userData: data.userData,
      })
    }

    this.logger.log({
      type: 'ALL GOOD - 200',
      status: 200,
      formId: data.formId,
      sendData: sendData.data,
    })
    return true
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
      alertError(
        `Max tries reached for formId: ${formId}. Last error state: ${error}. Next form state: ${FormState.ERROR} error: ${FormError.RABBITMQ_MAX_TRIES}`,
        this.logger,
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
      alertError(
        `Sending email of form ${form.id} has failed.`,
        this.logger,
        (error as Error).message,
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
          alertError(
            `Setting form error with id ${form.id} to EMAIL_SEND_ERROR failed.`,
            this.logger,
            JSON.stringify(error_),
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
      alertError(
        `Sending webhook of form ${form.id} has failed.`,
        this.logger,
        (error as Error).message,
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
          alertError(
            `Setting form error with id ${form.id} to WEBHOOK_SEND_ERROR failed.`,
            this.logger,
            JSON.stringify(error_),
          )
        })
      const requeueEmail = await this.nackTrueWithWait(20_000)
      return requeueEmail
    }
  }
}

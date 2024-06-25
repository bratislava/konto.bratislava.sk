import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { FormError, FormState, GinisState } from '@prisma/client'
import { Channel, ConsumeMessage } from 'amqplib'
import { isSlovenskoSkGenericFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'

import {
  FormsErrorsEnum,
  FormsErrorsResponseEnum,
} from '../forms/forms.errors.enum'
import PrismaService from '../prisma/prisma.service'
import RabbitmqClientService from '../rabbitmq-client/rabbitmq-client.service'
import {
  RABBIT_GINIS_AUTOMATION,
  RABBIT_MQ,
  RABBIT_NASES,
} from '../utils/constants'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import { MailgunTemplateEnum } from '../utils/global-services/mailgun/mailgun.constants'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import {
  getFrontendFormTitleFromForm,
  getSubjectTextFromForm,
} from '../utils/handlers/text.handler'
import alertError from '../utils/logging'
import { FormWithFiles } from '../utils/types/prisma'
import {
  GinisAssignSubmissionResponseInfo,
  GinisAutomationResponse,
  GinisCheckNasesPayloadDto,
  GinisEditSubmissionResponseInfo,
  GinisRegisterSubmissionResponse,
  GinisRegisterSubmissionResponseInfo,
  GinisUploadFileResponse,
  GinisUploadFileResponseInfo,
  GinisUploadInfo,
} from './dtos/ginis.response.dto'
import GinisHelper from './subservices/ginis.helper'

const UPLOAD_QUEUE = 'submission.upload'
const REGISTER_SUBMISSION_QUEUE = 'submission.register'
// const CHECK_UPLOADS_QUEUE = 'submission.attachments'
const ASSIGN_QUEUE = 'submission.assign'
const EDIT_SUBMISSION_QUEUE = 'submission.edit'

const GINIS_AUTOMATION_UPLOAD_QUEUE = 'ginis-automation.upload'
const GINIS_AUTOMATION_REGISTER_SUBMISSION_QUEUE = 'ginis-automation.register'
const GINIS_AUTOMATION_ASSIGN_QUEUE = 'ginis-automation.assign'
const GINIS_AUTOMATION_EDIT_SUBMISSION_QUEUE = 'ginis-automation.edit'

@Injectable()
export default class GinisService {
  private readonly logger: Logger

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly ginisHelper: GinisHelper,
    private mailgunService: MailgunService,
    private prismaService: PrismaService,
    private readonly rabbitMqClientService: RabbitmqClientService,
  ) {
    this.logger = new Logger('GinisService')

    if (
      !['production', 'development', 'staging'].includes(
        process.env.NODE_ENV ?? '',
      ) &&
      process.env.JEST_WORKER_ID === undefined
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        `.env value NODE_ENV must be set to 'production', 'development' or 'staging'`,
      )
    }
  }

  @RabbitRPC({
    exchange: RABBIT_GINIS_AUTOMATION.EXCHANGE,
    routingKey: REGISTER_SUBMISSION_QUEUE,
    queue: REGISTER_SUBMISSION_QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      alertError(
        `GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}, message: ${JSON.stringify(message)}`,
        new Logger('GinisService'),
      )
      channel.reject(message, false)
    },
  })
  public async consumeRegisterGinisMessage(
    content: GinisAutomationResponse<
      GinisRegisterSubmissionResponse,
      GinisRegisterSubmissionResponseInfo
    >,
  ): Promise<Nack> {
    this.logger.log(
      `Consuming register ginis message, content: ${JSON.stringify(content)}`,
    )
    if (content.status === 'failure') {
      await this.prismaService.forms.update({
        where: {
          id: content.info.msg_id,
        },
        data: {
          state: FormState.ERROR,
          error: FormError.GINIS_SEND_ERROR,
          ginisState: GinisState.ERROR_REGISTER,
        },
      })
      alertError(
        'ERROR - Ginis consumer - error to register - response from Ginis automation',
        this.logger,
        content.message,
      )
    } else {
      await this.prismaService.forms.update({
        where: { id: content.info.msg_id },
        data: {
          state: FormState.DELIVERED_GINIS,
          ginisDocumentId: content.result.identifier,
          error: FormError.NONE,
          ginisState: GinisState.REGISTERED,
        },
      })
      this.logger.debug('---- registered to ginis ----')
    }
    return new Nack()
  }

  @RabbitRPC({
    exchange: RABBIT_GINIS_AUTOMATION.EXCHANGE,
    routingKey: UPLOAD_QUEUE,
    queue: UPLOAD_QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      alertError(
        `GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`,
        new Logger('GinisService'),
      )
      channel.reject(message, false)
    },
  })
  public async consumeGinisFileUploaded(
    content: GinisAutomationResponse<
      GinisUploadFileResponse,
      GinisUploadFileResponseInfo
    >,
  ): Promise<Nack> {
    this.logger.log(
      `Consuming ginis file uploaded message, content: ${JSON.stringify(content)}`,
    )
    if (content.status === 'failure') {
      await this.prismaService.files.update({
        where: {
          id: content.info.file_id,
        },
        data: {
          ginisUploadedError: true,
        },
      })
      alertError(
        `ERROR - Ginis consumer - error upload File - response from Ginis automation. File id: ${content.info.file_id}.`,
        this.logger,
        content.message,
      )
    } else {
      await this.prismaService.files.update({
        where: { id: content.info.file_id },
        data: {
          ginisOrder:
            'Poradie' in content.result.upload_info
              ? +(content.result.upload_info as GinisUploadInfo).Poradie
              : undefined,
          ginisUploaded: true,
        },
      })
    }
    return new Nack()
  }

  @RabbitRPC({
    exchange: RABBIT_GINIS_AUTOMATION.EXCHANGE,
    routingKey: EDIT_SUBMISSION_QUEUE,
    queue: EDIT_SUBMISSION_QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      alertError(
        `GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`,
        new Logger('GinisService'),
      )
      channel.reject(message, false)
    },
  })
  public async consumeEditSubmission(
    content: GinisAutomationResponse<
      Record<string, never>,
      GinisEditSubmissionResponseInfo
    >,
  ): Promise<Nack> {
    this.logger.log(
      `Consuming edit ginis submission message, content: ${JSON.stringify(content)}`,
    )
    if (content.status === 'failure') {
      await this.prismaService.forms.update({
        where: {
          ginisDocumentId: content.info.doc_id,
        },
        data: {
          state: FormState.ERROR,
          error: FormError.GINIS_SEND_ERROR,
          ginisState: GinisState.ERROR_EDIT_SUBMISSION,
        },
      })
      alertError(
        `ERROR - Ginis consumer - error to edit document - response from Ginis automation. Document id: ${content.info.doc_id}`,
        this.logger,
        content.message,
      )
    } else {
      await this.prismaService.forms.update({
        where: { ginisDocumentId: content.info.doc_id },
        data: {
          ginisState: GinisState.SUBMISSION_EDITED,
          error: FormError.NONE,
        },
      })
      this.logger.debug('---- submission edited ----')
    }
    return new Nack()
  }

  @RabbitRPC({
    exchange: RABBIT_GINIS_AUTOMATION.EXCHANGE,
    routingKey: ASSIGN_QUEUE,
    queue: ASSIGN_QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      alertError(
        `GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`,
        new Logger('GinisService'),
      )
      channel.reject(message, false)
    },
  })
  public async consumeAssignSubmission(
    content: GinisAutomationResponse<
      Record<string, never>,
      GinisAssignSubmissionResponseInfo
    >,
  ): Promise<Nack> {
    this.logger.log(
      `Consuming assign ginis submission message, content: ${JSON.stringify(content)}`,
    )
    if (content.status === 'failure') {
      await this.prismaService.forms.update({
        where: {
          ginisDocumentId: content.info.doc_id,
        },
        data: {
          state: FormState.ERROR,
          error: FormError.GINIS_SEND_ERROR,
          ginisState: GinisState.ERROR_ASSIGN_SUBMISSION,
        },
      })
      alertError(
        `ERROR - Ginis consumer - error to assign document - response from Ginis automation. Document id: ${content.info.doc_id}`,
        this.logger,
        content.message,
      )
    } else {
      await this.prismaService.forms.update({
        where: { ginisDocumentId: content.info.doc_id },
        data: {
          ginisState: GinisState.SUBMISSION_ASSIGNED,
          error: FormError.NONE,
          state: FormState.PROCESSING,
        },
      })
      this.logger.debug('---- assigned to ginis ----')
    }
    return new Nack()
  }

  async registerToGinis(formId: string, pospId: string): Promise<void> {
    this.logger.debug('---- start to register to ginis ----')
    await this.prismaService.forms.update({
      where: {
        id: formId,
      },
      data: {
        ginisState: GinisState.RUNNING_REGISTER,
      },
    })

    await this.rabbitMqClientService.publishMessageToGinisAutomation(
      GINIS_AUTOMATION_REGISTER_SUBMISSION_QUEUE,
      process.env.NODE_ENV === 'production'
        ? {
            msg_id: formId,
            // TODO ownership, start_date, end_date so far default
          }
        : {
            msg_id: formId,
            document_type: pospId,
          },
      REGISTER_SUBMISSION_QUEUE,
    )
  }

  async uploadAttachments(form: FormWithFiles, pospID: string): Promise<void> {
    this.logger.debug('---- start to upload attachments ----')
    await this.prismaService.forms.update({
      where: {
        id: form.id,
      },
      data: {
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
      },
    })

    await Promise.all(
      form.files.map(async (file) => {
        if (file.ginisUploaded) return

        await this.rabbitMqClientService.publishMessageToGinisAutomation(
          GINIS_AUTOMATION_UPLOAD_QUEUE,
          {
            doc_id: form.ginisDocumentId,
            msg_id: form.id,
            s3_path: `${process.env.MINIO_SAFE_BUCKET ?? ''}/${pospID}/${form.id}/${file.minioFileName}`,
            filename: file.fileName,
            file_id: file.id,
          },
          UPLOAD_QUEUE,
        )
      }),
    )
  }

  async editSubmission(documentId: string, newSubject: string): Promise<void> {
    this.logger.debug('---- start to edit submission ----')
    await this.prismaService.forms.update({
      where: {
        ginisDocumentId: documentId,
      },
      data: {
        ginisState: GinisState.RUNNING_EDIT_SUBMISSION,
      },
    })

    await this.rabbitMqClientService.publishMessageToGinisAutomation(
      GINIS_AUTOMATION_EDIT_SUBMISSION_QUEUE,
      {
        doc_id: documentId,
        actions: {
          Vec: newSubject,
        },
      },
      EDIT_SUBMISSION_QUEUE,
    )
  }

  async assignSubmission(
    documentId: string,
    organization: string,
    person: string,
  ): Promise<void> {
    this.logger.debug('---- start to assign submission ----')
    await this.prismaService.forms.update({
      where: {
        ginisDocumentId: documentId,
      },
      data: {
        ginisState: GinisState.RUNNING_ASSIGN_SUBMISSION,
      },
    })

    await this.rabbitMqClientService.publishMessageToGinisAutomation(
      GINIS_AUTOMATION_ASSIGN_QUEUE,
      {
        doc_id: documentId,
        organization,
        person,
      },
      ASSIGN_QUEUE,
    )
  }

  async nackTrueWithWait(seconds: number): Promise<Nack> {
    if (process.env.JEST_WORKER_ID === undefined) {
      await setTimeout(seconds)
    }
    return new Nack(true)
  }

  @RabbitRPC({
    exchange: RABBIT_MQ.EXCHANGE,
    routingKey: RABBIT_NASES.ROUTING_KEY,
    queue: RABBIT_NASES.QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      // eslint-disable-next-line no-console
      console.error(`GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`)
      channel.reject(message, false)
    },
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public async onQueueConsumption(
    data: GinisCheckNasesPayloadDto,
  ): Promise<Nack> {
    this.logger.debug(`Consuming message for formId: ${data.formId}`)

    const form = await this.prismaService.forms.findUnique({
      where: { id: data.formId, archived: false },
      include: {
        files: {
          where: {
            ginisUploaded: false,
          },
        },
      },
    })

    // checks on form
    if (!form) {
      alertError(
        `ERROR - form not exists in Ginis consumption queue. Form id: ${data.formId}`,
        this.logger,
      )
      await this.ginisHelper.setFormToError(data.formId)
      return new Nack(false)
    }

    const formDefinition = getFormDefinitionBySlug(form.formDefinitionSlug)
    if (!formDefinition) {
      throw this.throwerErrorGuard.NotFoundException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_FOUND,
        `${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_FOUND} ${form.formDefinitionSlug}`,
      )
    }
    if (!isSlovenskoSkGenericFormDefinition(formDefinition)) {
      throw this.throwerErrorGuard.UnprocessableEntityException(
        FormsErrorsEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE,
        `onQueueConsumption: ${FormsErrorsResponseEnum.FORM_DEFINITION_NOT_SUPPORTED_TYPE}: ${formDefinition.type}, form id: ${form.id}`,
      )
    }

    const errorFiles = form.files.filter(
      (file) => file.ginisUploadedError === true,
    )
    const filesNotYetUploaded = form.files.filter((file) => !file.ginisUploaded)

    // Registration
    if (
      form.ginisState === GinisState.CREATED ||
      form.ginisState === GinisState.ERROR_REGISTER
    ) {
      await this.registerToGinis(form.id, formDefinition.pospID)
      return this.nackTrueWithWait(20_000)
    }

    if (form.ginisState === GinisState.RUNNING_REGISTER) {
      return this.nackTrueWithWait(20_000)
    }

    // Attachments upload
    if (form.ginisState === GinisState.REGISTERED && form.files.length > 0) {
      await this.uploadAttachments(form, formDefinition.pospID)
      return this.nackTrueWithWait(20_000)
    }

    if (
      form.ginisState === GinisState.ERROR_ATTACHMENT_UPLOAD ||
      (form.files.length === errorFiles.length && errorFiles.length > 0)
    ) {
      this.logger.error(
        '---- ERROR uploading attachments (manual intervention required) ----',
      )
      return this.nackTrueWithWait(20_000)
    }

    if (form.ginisState === GinisState.REGISTERED && form.files.length === 0) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          ginisState: GinisState.ATTACHMENTS_UPLOADED,
          error: FormError.NONE,
        },
      })
      this.logger.debug('---- attachments uploaded ----')
      return this.nackTrueWithWait(20_000)
    }

    // TODO: merge with previous case of zero files, think more about setting error to NONE in this case
    // this means we've finished uploading files and can move to next step
    if (
      form.ginisState === GinisState.RUNNING_UPLOAD_ATTACHMENTS &&
      filesNotYetUploaded.length === 0
    ) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          ginisState: GinisState.ATTACHMENTS_UPLOADED,
          error: FormError.NONE,
        },
      })
      this.logger.debug('---- attachments uploaded ----')
      return this.nackTrueWithWait(20_000)
    }

    // Edit submission
    if (
      form.ginisState === GinisState.ATTACHMENTS_UPLOADED ||
      form.ginisState === GinisState.ERROR_EDIT_SUBMISSION
    ) {
      if (!form.ginisDocumentId) {
        alertError(
          `ERROR - ginisDocumentId in form do not exists in Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return new Nack(false)
      }
      await this.editSubmission(
        form.ginisDocumentId,
        getSubjectTextFromForm(form, formDefinition),
      )
      return this.nackTrueWithWait(20_000)
    }

    // Assign Submission
    if (
      form.ginisState === GinisState.SUBMISSION_EDITED ||
      form.ginisState === GinisState.ERROR_ASSIGN_SUBMISSION
    ) {
      if (!form.ginisDocumentId) {
        alertError(
          `ERROR - documentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      await this.assignSubmission(
        form.ginisDocumentId,
        formDefinition.ginisAssignment.ginisOrganizationName,
        formDefinition.ginisAssignment.ginisPersonName,
      )
      return this.nackTrueWithWait(20_000)
    }
    if (form.ginisState === GinisState.SUBMISSION_ASSIGNED) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          state: FormState.PROCESSING,
          ginisState: GinisState.FINISHED,
          error: FormError.NONE,
        },
      })
      if (data.userData.email) {
        // fallback to messageSubject if title can't be parsed
        const formTitle =
          getFrontendFormTitleFromForm(form, formDefinition) ||
          getSubjectTextFromForm(form, formDefinition)
        await this.mailgunService.sendEmail({
          template: MailgunTemplateEnum.GINIS_DELIVERED,
          data: {
            formId: form.id,
            firstName: data.userData.firstName,
            messageSubject: formTitle,
            slug: form.formDefinitionSlug,
          },
          to: data.userData.email,
        })
      }

      return new Nack(false)
    }
    return this.nackTrueWithWait(20_000)
  }
}

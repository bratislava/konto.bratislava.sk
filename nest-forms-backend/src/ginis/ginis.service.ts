import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { FormError, FormState, GinisState } from '@prisma/client'
import { GenericObjectType } from '@rjsf/utils'
import { Channel, ConsumeMessage } from 'amqplib'
import { Queue } from 'bull'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import { isSlovenskoSkGenericFormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getFormDefinitionBySlug } from 'forms-shared/definitions/getFormDefinitionBySlug'
import {
  extractFormSubject,
  extractGinisSubject,
} from 'forms-shared/form-utils/formDataExtractors'

import BaConfigService from '../config/ba-config.service'
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
import MailgunService from '../utils/global-services/mailer/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import alertError, {
  LineLoggerSubservice,
} from '../utils/subservices/line-logger.subservice'
import MinioClientSubservice from '../utils/subservices/minio-client.subservice'
import { FormWithFiles } from '../utils/types/prisma'
import {
  GinisAssignSubmissionResponseInfo,
  GinisAutomationResponse,
  GinisCheckNasesPayloadDto,
  GinisEditSubmissionResponseInfo,
  GinisRegisterSubmissionResponse,
  GinisRegisterSubmissionResponseInfo,
} from './dtos/ginis.response.dto'
import GinisHelper from './subservices/ginis.helper'
import GinisAPIService from './subservices/ginis-api.service'

const REGISTER_SUBMISSION_QUEUE = 'submission.register'
const ASSIGN_QUEUE = 'submission.assign'
const EDIT_SUBMISSION_QUEUE = 'submission.edit'

const GINIS_AUTOMATION_REGISTER_SUBMISSION_QUEUE = 'ginis-automation.register'
const GINIS_AUTOMATION_ASSIGN_QUEUE = 'ginis-automation.assign'
const GINIS_AUTOMATION_EDIT_SUBMISSION_QUEUE = 'ginis-automation.edit'

@Injectable()
export default class GinisService {
  private readonly logger: LineLoggerSubservice

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly ginisHelper: GinisHelper,
    private readonly ginisApiService: GinisAPIService,
    private mailgunService: MailgunService,
    private readonly minioClientSubservice: MinioClientSubservice,
    private prismaService: PrismaService,
    private readonly rabbitMqClientService: RabbitmqClientService,
    @InjectQueue('sharepoint') private readonly sharepointQueue: Queue,
  ) {
    this.logger = new LineLoggerSubservice('GinisService')

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
        new LineLoggerSubservice('GinisService'),
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
    routingKey: EDIT_SUBMISSION_QUEUE,
    queue: EDIT_SUBMISSION_QUEUE,
    errorHandler: (channel: Channel, message: ConsumeMessage, error: Error) => {
      alertError(
        `GinisService RABBIT_MQ_ERROR: ${JSON.stringify(error)}`,
        new LineLoggerSubservice('GinisService'),
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
        new LineLoggerSubservice('GinisService'),
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

  private async updateFailedAttachmentUpload(fileId: string): Promise<void> {
    await this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        ginisUploadedError: true,
      },
    })
  }

  private async updateSuccessfulAttachmentUpload(
    fileId: string,
  ): Promise<void> {
    await this.prismaService.files.update({
      where: {
        id: fileId,
      },
      data: {
        ginisUploaded: true,
        ginisUploadedError: false,
      },
    })
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

    if (!form.ginisDocumentId) {
      alertError(
        `ERROR uploadAttachments - missing ginisDocumentId. Form id: ${form.id}`,
        this.logger,
      )
      return
    }

    // ginis can't handle parallel uploads, it's causing race conditions on their side
    for (const file of form.files) {
      if (file.ginisUploaded) {
        continue
      }

      try {
        // sometimes ginis times-out on the first try
        await this.ginisHelper.retryWithDelay(async () => {
          const fileStream = await this.minioClientSubservice.download(
            this.baConfigService.minio.buckets.safe,
            `${pospID}/${form.id}/${file.minioFileName}`,
          )

          return this.ginisApiService.uploadFile(
            form.ginisDocumentId!,
            file.fileName,
            fileStream,
          )
        })

        await this.updateSuccessfulAttachmentUpload(file.id)
      } catch (error) {
        alertError(
          `ERROR uploadAttachments - error upload file to ginis. Form id: ${form.id}; Ginis id: ${form.ginisDocumentId}; File id: ${file.id}`,
          this.logger,
          error,
        )
        await this.updateFailedAttachmentUpload(file.id)
      }
    }
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
    person?: string,
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
        ...(person ? { person } : {}),
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
        files: true,
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

    const filesWithError = form.files.filter((file) => file.ginisUploadedError)
    const filesToUpload = form.files.filter((file) => !file.ginisUploaded)

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
    if (form.ginisState === GinisState.REGISTERED && filesToUpload.length > 0) {
      if (!form.ginisDocumentId) {
        alertError(
          `ERROR uploadAttachments - ginisDocumentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      await this.uploadAttachments(form, formDefinition.pospID)
      return this.nackTrueWithWait(20_000)
    }

    if (
      form.ginisState === GinisState.ERROR_ATTACHMENT_UPLOAD ||
      filesWithError.length > 0
    ) {
      this.logger.error(
        '---- ERROR uploading attachments (manual intervention required) ----',
      )
      return this.nackTrueWithWait(20_000)
    }

    if (
      filesToUpload.length === 0 &&
      (form.ginisState === GinisState.RUNNING_UPLOAD_ATTACHMENTS ||
        form.ginisState === GinisState.REGISTERED)
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
          `ERROR editSubmission - ginisDocumentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      await this.editSubmission(
        form.ginisDocumentId,
        extractGinisSubject(
          formDefinition,
          form.formDataJson as GenericObjectType,
        ),
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
          `ERROR assignSubmission - ginisDocumentId does not exists in form - Ginis consumption queue. Form id: ${form.id}`,
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

    // Send externally
    if (form.ginisState === GinisState.SUBMISSION_ASSIGNED) {
      await this.prismaService.forms.update({
        where: { id: form.id },
        data: {
          state: formDefinition.sharepointData
            ? FormState.SENDING_TO_SHAREPOINT
            : FormState.PROCESSING,
          ginisState: GinisState.FINISHED,
          error: FormError.NONE,
        },
      })

      // Send to SharePoint
      if (formDefinition.sharepointData) {
        await this.sendToSharepoint(form.id)
      }

      // Send via email
      if (data.userData.email) {
        await this.mailgunService.sendEmail({
          data: {
            template: MailgunTemplateEnum.GINIS_DELIVERED,
            data: {
              formId: form.id,
              firstName: data.userData.firstName,
              messageSubject: extractFormSubject(
                formDefinition,
                form.formDataJson,
              ),
              slug: form.formDefinitionSlug,
            },
            to: data.userData.email,
          },
        })
      }

      return new Nack(false)
    }
    return this.nackTrueWithWait(20_000)
  }

  private async sendToSharepoint(formId: string): Promise<void> {
    this.logger.log(`Adding form ${formId} to sharepoint queue.`)
    await this.sharepointQueue.add(
      {
        formId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    )
  }
}

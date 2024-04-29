import { randomUUID } from 'node:crypto'
import { setTimeout } from 'node:timers/promises'

import { Nack, RabbitRPC } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { FormError, FormState, GinisState } from '@prisma/client'
import { Channel, ConsumeMessage } from 'amqplib'
import amqp from 'amqplib/callback_api'

import PrismaService from '../prisma/prisma.service'
import { RABBIT_MQ, RABBIT_NASES } from '../utils/constants'
import { ErrorsEnum } from '../utils/global-enums/errors.enum'
import { MailgunTemplateEnum } from '../utils/global-services/mailgun/mailgun.constants'
import MailgunService from '../utils/global-services/mailgun/mailgun.service'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { getSubjectTextFromForm } from '../utils/handlers/text.handler'
import alertError from '../utils/logging'
import { FormWithSchemaVersionAndFiles } from '../utils/types/prisma'
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

@Injectable()
export default class GinisService {
  private readonly logger: Logger

  private readonly ginisRabbitUrl: string

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly ginisHelper: GinisHelper,
    private mailgunService: MailgunService,
    private prismaService: PrismaService,
  ) {
    this.logger = new Logger('GinisService')

    if (
      !(
        process.env.RABBIT_MQ_GINIS_USERNAME &&
        process.env.RABBIT_MQ_GINIS_PASSWORD &&
        process.env.RABBIT_MQ_GINIS_HOST &&
        process.env.RABBIT_MQ_GINIS_PORT
      ) &&
      process.env.JEST_WORKER_ID === undefined
    ) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Some of these env values are not set: RABBIT_MQ_GINIS_USERNAME, RABBIT_MQ_GINIS_PASSWORD, RABBIT_MQ_GINIS_HOST, RABBIT_MQ_GINIS_PORT',
      )
    }
    this.ginisRabbitUrl = `amqp://${
      process.env.RABBIT_MQ_GINIS_USERNAME ?? ''
    }:${process.env.RABBIT_MQ_GINIS_PASSWORD ?? ''}@${
      process.env.RABBIT_MQ_GINIS_HOST ?? ''
    }:${process.env.RABBIT_MQ_GINIS_PORT ?? ''}`

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

  async consumeRegisterGinisMessage(msg: amqp.Message): Promise<void> {
    const content: GinisAutomationResponse<
      GinisRegisterSubmissionResponse,
      GinisRegisterSubmissionResponseInfo
    > = JSON.parse(msg.content.toString()) as GinisAutomationResponse<
      GinisRegisterSubmissionResponse,
      GinisRegisterSubmissionResponseInfo
    >

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
  }

  async consumeGinisFileUploaded(msg: amqp.Message): Promise<void> {
    const content: GinisAutomationResponse<
      GinisUploadFileResponse,
      GinisUploadFileResponseInfo
    > = JSON.parse(msg.content.toString()) as GinisAutomationResponse<
      GinisUploadFileResponse,
      GinisUploadFileResponseInfo
    >

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
  }

  async consumeEditSubmission(msg: amqp.Message): Promise<void> {
    const content: GinisAutomationResponse<
      Record<string, never>,
      GinisEditSubmissionResponseInfo
    > = JSON.parse(msg.content.toString()) as GinisAutomationResponse<
      Record<string, never>,
      GinisEditSubmissionResponseInfo
    >

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
  }

  async consumeAssignSubmission(msg: amqp.Message): Promise<void> {
    const content: GinisAutomationResponse<
      Record<string, never>,
      GinisAssignSubmissionResponseInfo
    > = JSON.parse(msg.content.toString()) as GinisAutomationResponse<
      Record<string, never>,
      GinisAssignSubmissionResponseInfo
    >

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
    // eslint-disable-next-line scanjs-rules/call_connect
    amqp.connect(this.ginisRabbitUrl, (error0, connection) => {
      if (error0) {
        alertError(
          'ERROR - ginis consume message - register to ginis',
          this.logger,
          <string>error0,
        )
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          alertError(
            'ERROR - ginis consume message - register to ginis',
            this.logger,
            <string>error1,
          )
        }
        channel.assertQueue(
          '',
          {
            exclusive: true,
          },
          (error2, q) => {
            if (error2) {
              alertError(
                'ERROR - ginis consume message - register to ginis',
                this.logger,
                <string>error1,
              )
            }
            const correlationId = randomUUID()

            channel.consume(
              q.queue,
              (msg) => {
                if (msg?.properties.correlationId === correlationId) {
                  this.consumeRegisterGinisMessage(msg).catch((error) => {
                    alertError(
                      `CONSUME_REGISTER_GINIS_MESSAGE_ERROR: An error occured while consuming ginis file uploaded message: ${JSON.stringify(
                        msg,
                      )}`,
                      this.logger,
                      <string>error,
                    )
                  })
                  connection.close()
                }
              },
              {
                noAck: true,
              },
            )

            channel.sendToQueue(
              REGISTER_SUBMISSION_QUEUE,
              Buffer.from(
                JSON.stringify(
                  process.env.NODE_ENV === 'production'
                    ? {
                        msg_id: formId,
                        // TODO ownership, start_date, end_date so far default
                      }
                    : {
                        msg_id: formId,
                        document_type: pospId,
                      },
                ),
              ),
              {
                correlationId,
                replyTo: q.queue,
                contentType: 'application/json',
              },
            )
          },
        )
      })
    })
  }

  async uploadAttachments(form: FormWithSchemaVersionAndFiles): Promise<void> {
    this.logger.debug('---- start to upload attachments ----')
    await this.prismaService.forms.update({
      where: {
        id: form.id,
      },
      data: {
        ginisState: GinisState.RUNNING_UPLOAD_ATTACHMENTS,
      },
    })
    // eslint-disable-next-line sonarjs/cognitive-complexity
    form.files.forEach((file) => {
      if (file.ginisUploaded) return
      // eslint-disable-next-line scanjs-rules/call_connect
      amqp.connect(this.ginisRabbitUrl, (error0, connection) => {
        if (error0) {
          alertError(
            'ERROR - ginis consume message - update file',
            this.logger,
            <string>error0,
          )
        }
        connection.createChannel((error1, channel) => {
          if (error1) {
            alertError(
              'ERROR - ginis consume message - update file',
              this.logger,
              <string>error1,
            )
          }
          channel.assertQueue(
            '',
            {
              exclusive: true,
            },
            (error2, q) => {
              if (error2) {
                alertError(
                  'ERROR - ginis consume message - update file',
                  this.logger,
                  <string>error2,
                )
              }
              const correlationId = randomUUID()

              channel.consume(
                q.queue,
                (msg) => {
                  if (msg?.properties.correlationId === correlationId) {
                    this.consumeGinisFileUploaded(msg).catch((error) => {
                      alertError(
                        `CONSUME_GINIS_FILE_UPLOADED_ERROR: An error occured while consuming ginis file uploaded message: ${JSON.stringify(
                          msg,
                        )}`,
                        this.logger,
                        <string>error,
                      )
                    })
                    connection.close()
                  }
                },
                {
                  noAck: true,
                },
              )

              channel.sendToQueue(
                UPLOAD_QUEUE,
                Buffer.from(
                  JSON.stringify({
                    doc_id: form.ginisDocumentId,
                    msg_id: form.id,
                    s3_path: `${process.env.MINIO_SAFE_BUCKET ?? ''}/${
                      form.schemaVersion.pospID
                    }/${form.id}/${file.minioFileName}`,
                    filename: file.fileName,
                    file_id: file.id,
                  }),
                ),
                {
                  correlationId,
                  replyTo: q.queue,
                  contentType: 'application/json',
                },
              )
            },
          )
        })
      })
    })
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
    // eslint-disable-next-line scanjs-rules/call_connect
    amqp.connect(this.ginisRabbitUrl, (error0, connection) => {
      if (error0) {
        alertError(
          'ERROR - ginis consume message - edit document',
          this.logger,
          <string>error0,
        )
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          alertError(
            'ERROR - ginis consume message - update file',
            this.logger,
            <string>error1,
          )
        }
        channel.assertQueue(
          '',
          {
            exclusive: true,
          },
          (error2, q) => {
            if (error2) {
              alertError(
                'ERROR - ginis consume message - update file',
                this.logger,
                <string>error2,
              )
            }
            const correlationId = randomUUID()

            channel.consume(
              q.queue,
              (msg) => {
                if (msg?.properties.correlationId === correlationId) {
                  this.consumeEditSubmission(msg).catch((error) => {
                    alertError(
                      `CONSUME_EDIT_SUBMISSION_ERROR: An error occured while consuming ginis edit submission message: ${JSON.stringify(
                        msg,
                      )}`,
                      this.logger,
                      <string>error,
                    )
                  })
                  connection.close()
                }
              },
              {
                noAck: true,
              },
            )

            channel.sendToQueue(
              EDIT_SUBMISSION_QUEUE,
              Buffer.from(
                JSON.stringify({
                  doc_id: documentId,
                  actions: {
                    Vec: newSubject,
                  },
                }),
              ),
              {
                correlationId,
                replyTo: q.queue,
                contentType: 'application/json',
              },
            )
          },
        )
      })
    })
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
    // eslint-disable-next-line scanjs-rules/call_connect
    amqp.connect(this.ginisRabbitUrl, (error0, connection) => {
      if (error0) {
        alertError(
          'ERROR - ginis consume message - edit document',
          this.logger,
          <string>error0,
        )
      }
      connection.createChannel((error1, channel) => {
        if (error1) {
          alertError(
            'ERROR - ginis consume message - update file',
            this.logger,
            <string>error1,
          )
        }
        channel.assertQueue(
          '',
          {
            exclusive: true,
          },
          (error2, q) => {
            if (error2) {
              alertError(
                'ERROR - ginis consume message - update file',
                this.logger,
                <string>error2,
              )
            }
            const correlationId = randomUUID()

            channel.consume(
              q.queue,
              (msg) => {
                if (msg?.properties.correlationId === correlationId) {
                  this.consumeAssignSubmission(msg).catch((error) => {
                    alertError(
                      `CONSUME_ASSIGN_SUBMISSION_ERROR: An error occured while consuming ginis assign submission message: ${JSON.stringify(
                        msg,
                      )}`,
                      this.logger,
                      <string>error,
                    )
                  })
                  connection.close()
                }
              },
              {
                noAck: true,
              },
            )

            channel.sendToQueue(
              ASSIGN_QUEUE,
              Buffer.from(
                JSON.stringify({
                  doc_id: documentId,
                  organization,
                  person,
                }),
              ),
              {
                correlationId,
                replyTo: q.queue,
                contentType: 'application/json',
              },
            )
          },
        )
      })
    })
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
    _: any,
    amqpMessage: ConsumeMessage,
  ): Promise<Nack> {
    const data = <GinisCheckNasesPayloadDto>(
      JSON.parse(amqpMessage.content.toString())
    )
    this.logger.debug(`Consuming message for formId: ${data.formId}`)

    const form = await this.prismaService.forms.findUnique({
      where: { id: data.formId, archived: false },
      include: {
        files: {
          where: {
            ginisUploaded: false,
          },
        },
        schemaVersion: { include: { schema: true } },
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

    if (!form.schemaVersion.pospID) {
      await this.ginisHelper.setFormToError(data.formId)
      alertError(
        `ERROR - posp id in form do not exists in Ginis consumption queue. Form id: ${form.id}`,
        this.logger,
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
      await this.registerToGinis(form.id, form.schemaVersion.pospID)
      return this.nackTrueWithWait(20_000)
    }

    if (form.ginisState === GinisState.RUNNING_REGISTER) {
      return this.nackTrueWithWait(20_000)
    }

    // Attachments upload
    if (form.ginisState === GinisState.REGISTERED && form.files.length > 0) {
      await this.uploadAttachments(form)
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
        getSubjectTextFromForm(form),
      )
      return this.nackTrueWithWait(20_000)
    }

    // Assign Submission
    if (
      form.ginisState === GinisState.SUBMISSION_EDITED ||
      form.ginisState === GinisState.ERROR_ASSIGN_SUBMISSION
    ) {
      if (
        !form.ginisDocumentId ||
        !form.schemaVersion.ginisOrganizationName ||
        !form.schemaVersion.ginisPersonName
      ) {
        alertError(
          `ERROR - documentId or Organization to ginis or Person to ginis  do not exists in form - Ginis consumption queue. Form id: ${form.id}`,
          this.logger,
        )
        return this.nackTrueWithWait(20_000)
      }
      await this.assignSubmission(
        form.ginisDocumentId,
        form.schemaVersion.ginisOrganizationName,
        form.schemaVersion.ginisPersonName,
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
        await this.mailgunService.sendEmail({
          template: MailgunTemplateEnum.GINIS_DELIVERED,
          data: {
            formId: form.id,
            firstName: data.userData.firstName,
            messageSubject: getSubjectTextFromForm(form),
            slug: form.schemaVersion.schema.slug,
          },
          to: data.userData.email,
        })
      }

      return new Nack(false)
    }
    return this.nackTrueWithWait(20_000)
  }
}

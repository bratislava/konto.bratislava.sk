import {
  ErrorEnum,
  ErrorFactoryService,
  LineLoggerSubservice,
} from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { Interfaces } from 'mailgun.js/definitions'

import BaConfigService from '../config/ba-config.service'
import { FormError } from '../generated/prisma/client'
import PrismaService from '../prisma/prisma.service'
import { Mailer, MailerSendEmailParams } from './mailer.interface'
import { getMailgunConfig } from './mailgun.constants'
import MailgunHelper from './utils/mailgun.helper'

@Injectable()
export default class MailgunService implements Mailer {
  mailgunClient: Interfaces.IMailgunClient

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly mailgunHelper: MailgunHelper,
    private readonly prismaService: PrismaService,
    private readonly logger: LineLoggerSubservice,
  ) {
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: this.baConfigService.mailgun.apiKey,
      url: this.baConfigService.mailgun.host,
    })
  }

  private async setFormToEmailErrorState(formId: string) {
    await this.prismaService.forms.update({
      where: { id: formId },
      data: {
        error: FormError.EMAIL_SEND_ERROR,
      },
    })
  }

  async sendEmail(params: MailerSendEmailParams): Promise<void> {
    const { data, emailFrom, replyTo, attachments, subject } = params
    const mailgunAttachments = attachments?.map((attachment) => ({
      data: attachment.content,
      filename: attachment.filename,
    }))

    try {
      const mailgunConfig = getMailgunConfig(this.baConfigService)
      const renderLocally = !!mailgunConfig[data.template].renderLocally
      const { template } = mailgunConfig[data.template]
      const variables = this.mailgunHelper.createEmailVariables(data)

      const emailContent = renderLocally
        ? {
            html: await this.mailgunHelper.getFilledTemplate(
              template,
              variables,
            ),
          }
        : {
            'h:X-Mailgun-Variables': JSON.stringify(variables),
            template,
          }

      const mailgunResponse = await this.mailgunClient.messages.create(
        this.baConfigService.mailgun.domain,
        {
          from: emailFrom || this.baConfigService.mailgun.emailFrom,
          to: data.to,
          subject: subject ?? mailgunConfig[data.template].subject,
          attachment: mailgunAttachments,
          ...(replyTo ? { 'h:Reply-To': replyTo } : {}),
          ...emailContent,
        },
      )
      if (mailgunResponse.status !== 200) {
        throw this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: `Mailgun message was not sent to email.`,
          console: {
            formId: data.data.formId,
            template: data.template,
            mailgunResponse,
            attachmentCount: attachments?.length ?? 0,
          },
        })
      }
    } catch (error) {
      this.logger.error(
        this.errorFactoryService.InternalServerErrorException({
          errorEnum: ErrorEnum.INTERNAL_SERVER_ERROR,
          message: 'ERROR to send mailgun message',
          console: {
            formId: data.data.formId,
            template: data.template,
            attachmentCount: attachments?.length ?? 0,
          },
          error,
        }),
      )
      await this.setFormToEmailErrorState(data.data.formId)
    }
  }
}

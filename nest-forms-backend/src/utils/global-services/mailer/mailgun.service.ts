import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FormError } from '@prisma/client'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'

import PrismaService from '../../../prisma/prisma.service'
import { ErrorsEnum } from '../../global-enums/errors.enum'
import ThrowerErrorGuard from '../../guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../subservices/line-logger.subservice'
import { Mailer, MailerSendEmailParams } from './mailer.interface'
import { MAILGUN_CONFIG } from './mailgun.constants'
import MailgunHelper from './utils/mailgun.helper'

@Injectable()
export default class MailgunService implements Mailer {
  mailgunClient: IMailgunClient

  logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly mailgunHelper: MailgunHelper,
    private readonly prismaService: PrismaService,
  ) {
    if (
      !process.env.MAILGUN_API_KEY ||
      !process.env.MAILGUN_HOST ||
      !process.env.MAILGUN_EMAIL_FROM ||
      !process.env.MAILGUN_DOMAIN
    ) {
      throw new Error(
        'Missing mailgun env, one of: MAILGUN_API_KEY, MAILGUN_HOST, MAILGUN_EMAIL_FROM, MAILGUN_DOMAIN',
      )
    }
    this.logger = new LineLoggerSubservice(MailgunService.name)
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: this.configService.get('MAILGUN_API_KEY') || '',
      url: this.configService.get('MAILGUN_HOST'),
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
    const { data, emailFrom, attachments, subject } = params
    const mailgunAttachments = attachments?.map((attachment) => ({
      data: attachment.content,
      filename: attachment.filename,
    }))

    try {
      const renderLocally = !!MAILGUN_CONFIG[data.template].renderLocally
      const { template } = MAILGUN_CONFIG[data.template]
      const variables = MailgunHelper.createEmailVariables(data)

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
        process.env.MAILGUN_DOMAIN!,
        {
          from: emailFrom ?? process.env.MAILGUN_EMAIL_FROM!,
          to: data.to,
          subject: subject ?? MAILGUN_CONFIG[data.template].subject,
          attachment: mailgunAttachments,
          ...emailContent,
        },
      )
      if (mailgunResponse.status !== 200) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          `Mailgun message was not sent to email.`,
          {
            formId: data.data.formId,
            emailFrom,
            emailTo: data.to,
            subject,
            mailgunResponse,
            filenames: attachments?.map((attachment) => attachment.filename),
          },
        )
      }
    } catch (error) {
      this.logger.error(
        this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'ERROR to send mailgun message',
          {
            formId: data.data.formId,
            emailFrom,
            emailTo: data.to,
            subject,
            filenames: attachments?.map((attachment) => attachment.filename),
          },
          error,
        ),
      )
      await this.setFormToEmailErrorState(data.data.formId)
    }
  }
}

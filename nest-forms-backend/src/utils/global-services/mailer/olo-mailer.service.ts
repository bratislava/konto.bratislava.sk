import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer from 'nodemailer'

import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../../guards/thrower-error.guard'
import { LineLoggerSubservice } from '../../subservices/line-logger.subservice'
import { Mailer, MailerSendEmailParams } from './mailer.interface'
import { MAILGUN_CONFIG } from './mailgun.constants'
import MailgunHelper from './utils/mailgun.helper'

@Injectable()
export default class OloMailerService implements Mailer {
  oloTransporter: nodemailer.Transporter

  logger: LineLoggerSubservice

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly mailgunHelper: MailgunHelper,
  ) {
    this.logger = new LineLoggerSubservice(OloMailerService.name)

    this.oloTransporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: this.configService.getOrThrow<string>('OLO_SMTP_USERNAME'),
        pass: this.configService.getOrThrow<string>('OLO_SMTP_PASSWORD'),
      },
      tls: {
        ciphers: 'SSLv3',
      },
    })
  }

  /**
   * Sends an email using OLO SMTP instead of Mailgun.
   * @param data Object containing the email data which should be sent.
   * @param oloEmailFrom The email address to send the email from.
   * @param attachments Optional array of attachments to be sent with the email.
   */
  async sendEmail(params: MailerSendEmailParams): Promise<void> {
    const { data, emailFrom, attachments, subject } = params
    try {
      const mailBody = await this.mailgunHelper.getFilledTemplate(
        MAILGUN_CONFIG[data.template].template,
        MailgunHelper.createEmailVariables(data),
      )
      await this.oloTransporter.sendMail({
        from: `OLO <${emailFrom}>`,
        to: data.to,
        subject: subject ?? MAILGUN_CONFIG[data.template].subject,
        // eslint-disable-next-line xss/no-mixed-html
        html: mailBody,
        attachments,
      })
    } catch (error) {
      this.throwerErrorGuard.InternalServerErrorException(
        MailgunErrorsEnum.SEND_OLO_MAIL_ERROR,
        `${MailgunErrorsResponseEnum.SEND_OLO_MAIL_ERROR}: ${(error as Error).message}`,
      )
    }
  }
}

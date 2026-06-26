import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'

import BaConfigService from '../../../config/ba-config.service'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../utils/global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../utils/guards/thrower-error.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { Mailer, MailerSendEmailParams } from './mailer.interface'
import { getMailgunConfig } from './mailgun.constants'
import MailgunHelper from './utils/mailgun.helper'

@Injectable()
export default class OloMailerService implements Mailer {
  oloTransporter: nodemailer.Transporter

  logger: LineLoggerSubservice

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly mailgunHelper: MailgunHelper,
  ) {
    this.logger = new LineLoggerSubservice(OloMailerService.name)

    // eslint-disable-next-line sonarjs/no-clear-text-protocols -- 'smtp.office365.com' is an SMTP hostname, not an HTTP URL; STARTTLS on port 587 provides transport security
    this.oloTransporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: this.baConfigService.olo.smtp.username,
        pass: this.baConfigService.olo.smtp.password,
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
    const { data, emailFrom, replyTo, attachments, subject } = params
    try {
      const mailgunConfig = getMailgunConfig(this.baConfigService)
      const mailBody = await this.mailgunHelper.getFilledTemplate(
        mailgunConfig[data.template].template,
        this.mailgunHelper.createEmailVariables(data),
      )
      await this.oloTransporter.sendMail({
        from: `OLO <${emailFrom}>`,
        to: data.to,
        replyTo,
        subject: subject ?? mailgunConfig[data.template].subject,
        html: mailBody,
        attachments,
      })
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        MailgunErrorsEnum.SEND_OLO_MAIL_ERROR,
        MailgunErrorsResponseEnum.SEND_OLO_MAIL_ERROR,
        undefined,
        error,
      )
    }
  }
}

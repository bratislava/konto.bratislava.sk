import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport'

import BaConfigService from '../../config/ba-config.service'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import ThrowerErrorGuard from '../guards/errors.guard'
import { LineLoggerSubservice } from './line-logger.subservice'

/**
 * EmailSubservice handles the functionality of sending emails using an SMTP
 * transporter with optional support for attachments.
 *
 * The service is configured via environment variables, including a fixed sender
 * email set by the AWS_SES_SENDER_EMAIL variable.
 *
 * @note We use AWS SES (Simple Email Service) instead of Mailgun due to GDPR
 * compliance requirements, ensuring that email data is handled securely and
 * within GDPR-regulated regions.
 */
@Injectable()
export default class EmailSubservice {
  private readonly logger = new LineLoggerSubservice(EmailSubservice.name)

  private readonly transporter: nodemailer.Transporter<SentMessageInfo>

  constructor(
    private readonly baConfigService: BaConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.transporter = nodemailer.createTransport({
      host: `email-smtp.${this.baConfigService.cognito.region}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: {
        user: this.baConfigService.smtp.username,
        pass: this.baConfigService.smtp.password,
      },
    })
  }

  /**
   * Send an email with or without attachments.
   *
   * @param to List of email recipients
   * @param subject Email subject
   * @param message Email body/text content
   * @param attachments Optional list of attachments as base64-encoded strings
   */
  async send(
    to: string[],
    subject: string,
    message: string,
    attachments?: { filename: string; content: string; contentType: string }[],
  ): Promise<void> {
    try {
      const emailOptions = {
        from: this.baConfigService.smtp.email,
        to: to.join(', '),
        subject,
        text: message,
        attachments,
      }

      const info = await this.transporter.sendMail(emailOptions)

      this.logger.log(
        `Report email sent successfully to ${to.join(', ')}: ${info.messageId}`,
        { emailOptions },
      )
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to send daily payment email report.',
        undefined,
        undefined,
        error,
      )
    }
  }
}

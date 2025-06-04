import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import nodemailer from 'nodemailer'

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

  private readonly transporter: nodemailer.Transporter

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.transporter = nodemailer.createTransport({
      host: `email-smtp.${this.configService.getOrThrow<string>('COGNITO_REGION')}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: {
        user: this.configService.getOrThrow<string>('AWS_SES_SMTP_USERNAME'),
        pass: this.configService.getOrThrow<string>('AWS_SES_SMTP_PASSWORD'),
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
        from: this.configService.getOrThrow<string>('AWS_SES_SENDER_EMAIL'),
        to: to.join(', '),
        subject,
        text: message,
        attachments,
      }

      const info = await this.transporter.sendMail(emailOptions)

      this.logger.log(
        `Report email sent successfully to ${to.join(', ')}: ${info.messageId}`,
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

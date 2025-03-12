import { Injectable } from '@nestjs/common'
import nodemailer from 'nodemailer'
import { ConfigService } from '@nestjs/config'
import ThrowerErrorGuard from '../guards/errors.guard'
import { ErrorsEnum } from '../guards/dtos/error.dto'
import { LineLoggerSubservice } from './line-logger.subservice'

@Injectable()
export default class EmailSubservice {
  private readonly logger = new LineLoggerSubservice(EmailSubservice.name)

  private transporter: nodemailer.Transporter

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
  ) {
    this.transporter = nodemailer.createTransport({
      host: `email-smtp.${process.env.COGNITO_REGION}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USERNAME'),
        pass: this.configService.getOrThrow<string>('SMTP_PASSWORD'),
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
        from: this.configService.getOrThrow<string>('SENDER_EMAIL'),
        to: to.join(', '),
        subject,
        text: message,
        attachments,
      }
      // console.log(JSON.stringify(emailOptions, undefined, 2))

      const info = await this.transporter.sendMail(emailOptions)

      this.logger.log(
        `Report email sent successfully to ${to.join(', ')}: ${info.messageId}`,
      )
    } catch (error) {
      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Failed to send daily payment email report.',
          undefined,
          undefined,
          error,
        )
      }
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        'Failed to send daily payment email report.',
        undefined,
        <string>error,
      )
    }
  }
}

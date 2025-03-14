import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'

import {
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../global-dtos/mailgun.dto'
import { LineLoggerSubservice } from '../../subservices/line-logger.subservice'
import { Mailer } from './mailer.interface'
import {
  MAILGUN_CONFIG,
  MAILGUN_CONFIG_FEEDBACK_URLS,
  MailgunConfigVariableType,
} from './mailgun.constants'

@Injectable()
export default class MailgunService implements Mailer {
  mailgunClient: IMailgunClient

  logger: LineLoggerSubservice

  constructor(private readonly configService: ConfigService) {
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

  private createEmailVariables(data: SendEmailInputDto): SendEmailVariablesDto {
    const response: SendEmailVariablesDto = {}
    Object.entries(MAILGUN_CONFIG[data.template].variables).forEach(
      ([key, val]) => {
        switch (val.type) {
          case MailgunConfigVariableType.PARAMETER:
            Object.entries(data.data).forEach(([k, v]) => {
              if (v) {
                response[key as keyof SendEmailVariablesDto] = (
                  response[key as keyof SendEmailVariablesDto] || val.value
                )
                  .toString()
                  .replace(`{{${k}}}`, v)
              }
            })

            break

          case MailgunConfigVariableType.SELECT:
            if (
              typeof val.value === 'object' &&
              Object.prototype.hasOwnProperty.call(val.value, data.data.slug)
            ) {
              response[key as keyof SendEmailVariablesDto] =
                val.value[
                  data.data.slug as keyof typeof MAILGUN_CONFIG_FEEDBACK_URLS
                ]
            }

            break

          case MailgunConfigVariableType.STRING:
            response[key as keyof SendEmailVariablesDto] = val.value
              ? val.value.toString()
              : ''

            break

          default:
            response[key as keyof SendEmailVariablesDto] = undefined
          // No default
        }
      },
    )
    return response
  }

  async sendEmail(
    data: SendEmailInputDto,
    emailFrom?: string,
    attachments?: { filename: string; content: Buffer }[],
  ): Promise<void> {
    const mailgunAttachments = attachments?.map((attachment) => ({
      data: attachment.content,
      filename: attachment.filename,
    }))
    try {
      const mailgunResponse = await this.mailgunClient.messages.create(
        process.env.MAILGUN_DOMAIN!,
        {
          from: emailFrom ?? process.env.MAILGUN_EMAIL_FROM!,
          to: data.to,
          template: MAILGUN_CONFIG[data.template].template,
          subject: MAILGUN_CONFIG[data.template].subject,
          'h:X-Mailgun-Variables': JSON.stringify(
            this.createEmailVariables(data),
          ),
          attachment: mailgunAttachments,
        },
      )
      if (mailgunResponse.status !== 200)
        this.logger.warn(`Mailgun message was not sent for email `)
    } catch (error) {
      this.logger.error('ERROR to send mailgun message', error)
    }
  }
}

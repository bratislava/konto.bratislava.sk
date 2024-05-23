import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'

// import { IMailgunClient } from 'mailgun.js/Interfaces'
import {
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../global-dtos/mailgun.dto'
import {
  MAILGUN_CONFIG,
  MAILGUN_CONFIG_FEEDBACK_URLS,
  MailgunConfigVariableType,
} from './mailgun.constants'

@Injectable()
export default class MailgunService {
  mailgunClient: IMailgunClient

  constructor() {
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
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_HOST,
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

  async sendEmail(data: SendEmailInputDto): Promise<void> {
    try {
      const mailgunResponse = await this.mailgunClient.messages.create(
        process.env.MAILGUN_DOMAIN!,
        {
          from: process.env.MAILGUN_EMAIL_FROM!,
          to: data.to,
          template: MAILGUN_CONFIG[data.template].template,
          subject: MAILGUN_CONFIG[data.template].subject,
          'h:X-Mailgun-Variables': JSON.stringify(
            this.createEmailVariables(data),
          ),
        },
      )
      if (mailgunResponse.status !== 200)
        console.warn(`Mailgun message was not sent for email `)
    } catch (error) {
      console.error('ERROR to send mailgun message', error)
    }
  }
}

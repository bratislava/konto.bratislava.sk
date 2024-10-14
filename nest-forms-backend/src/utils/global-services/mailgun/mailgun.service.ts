import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'
import FormData from 'form-data'
import Handlebars from 'handlebars'
import Mailgun from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'
import nodemailer from 'nodemailer'

import {
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../../guards/thrower-error.guard'
import {
  MAILGUN_CONFIG,
  MAILGUN_CONFIG_FEEDBACK_URLS,
  MailgunConfigVariableType,
} from './mailgun.constants'

@Injectable()
export default class MailgunService {
  mailgunClient: IMailgunClient

  oloTransporter: nodemailer.Transporter

  constructor(
    private readonly configService: ConfigService,
    private readonly throwerErrorGuard: ThrowerErrorGuard,
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
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || '',
      url: process.env.MAILGUN_HOST,
    })

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

  /**
   * Sends an email using OLO SMTP instead of Mailgun.
   * @param data Object containing the email data which should be sent.
   */
  async sendOloEmail(data: SendEmailInputDto): Promise<void> {
    try {
      const mailBody = await this.getFilledTemplate(
        MAILGUN_CONFIG[data.template].template,
        this.createEmailVariables(data),
      )
      await this.oloTransporter.sendMail({
        from: this.configService.getOrThrow<string>('OLO_EMAIL_FROM'),
        to: data.to,
        subject: MAILGUN_CONFIG[data.template].subject,
        // eslint-disable-next-line xss/no-mixed-html
        html: mailBody,
      })
    } catch (error) {
      this.throwerErrorGuard.InternalServerErrorException(
        MailgunErrorsEnum.SEND_OLO_MAIL_ERROR,
        `${MailgunErrorsResponseEnum.SEND_OLO_MAIL_ERROR}: ${(error as Error).message}`,
      )
    }
  }

  /**
   * Retrieves a Mailgun email template through API and fills it with provided variables using Handlebars.
   *
   * @async
   * @param {string} templateName - The name of the Mailgun template to retrieve.
   * @param {SendEmailVariablesDto} variables - An object containing variables to be inserted into the template.
   * @returns {Promise<string>} A promise that resolves to the filled template as an html string.
   * @throws {HttpException} Throws an error if the Mailgun template is not found.
   */
  async getFilledTemplate(
    templateName: string,
    variables: SendEmailVariablesDto,
  ): Promise<string> {
    const url = `https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/templates/${templateName}`
    const auth = `api:${process.env.MAILGUN_API_KEY}`
    const response = await axios.get(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(auth).toString('base64')}`,
      },
      params: {
        active: true,
      },
    })
    if (!response.data) {
      throw this.throwerErrorGuard.NotFoundException(
        MailgunErrorsEnum.TEMPLATE_NOT_FOUND,
        `${MailgunErrorsResponseEnum.TEMPLATE_NOT_FOUND}: ${templateName}`,
      )
    }
    const { template } = response.data.template.version

    const compiledTemplate = Handlebars.compile(template)
    return compiledTemplate(variables)
  }
}

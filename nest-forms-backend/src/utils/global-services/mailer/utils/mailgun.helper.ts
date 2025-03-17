import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import FormData from 'form-data'
import Handlebars from 'handlebars'
import Mailgun, { TemplateQuery } from 'mailgun.js'
import { IMailgunClient } from 'mailgun.js/Interfaces'

import {
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../../global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../../global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../../../guards/thrower-error.guard'
import { MAILGUN_CONFIG, MailgunConfigVariableType } from '../mailgun.constants'

@Injectable()
export default class MailgunHelper {
  mailgunClient: IMailgunClient

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly configService: ConfigService,
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
      key: this.configService.getOrThrow('MAILGUN_API_KEY'),
      url: this.configService.getOrThrow('MAILGUN_HOST'),
    })
  }

  static createEmailVariables(data: SendEmailInputDto): SendEmailVariablesDto {
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
                val.value[data.data.slug as keyof typeof val.value]
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
    const response = await this.mailgunClient.domains.domainTemplates.get(
      this.configService.getOrThrow('MAILGUN_DOMAIN'),
      templateName,
      { active: 'yes' } as TemplateQuery, // There is an error when importing mailgun.js/Enums, thus this is needed
    )

    if (!response || !response.version?.template) {
      throw this.throwerErrorGuard.NotFoundException(
        MailgunErrorsEnum.TEMPLATE_NOT_FOUND,
        `${MailgunErrorsResponseEnum.TEMPLATE_NOT_FOUND}: ${templateName}`,
      )
    }

    const compiledTemplate = Handlebars.compile(response.version.template)
    return compiledTemplate(variables)
  }
}

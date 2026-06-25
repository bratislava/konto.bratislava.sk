import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import Handlebars from 'handlebars'
import Mailgun from 'mailgun.js'
import { Interfaces, TemplateQuery } from 'mailgun.js/definitions'

import BaConfigService from '../../../../config/ba-config.service'
import {
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../../global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../../global-enums/mailgun.errors.enum'
import ThrowerErrorGuard from '../../../guards/thrower-error.guard'
import {
  getMailgunConfig,
  MailgunConfigVariableType,
} from '../mailgun.constants'

@Injectable()
export default class MailgunHelper {
  mailgunClient: Interfaces.IMailgunClient

  constructor(
    private readonly throwerErrorGuard: ThrowerErrorGuard,
    private readonly baConfigService: BaConfigService,
  ) {
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: this.baConfigService.mailgun.apiKey,
      url: this.baConfigService.mailgun.host,
    })
  }

  createEmailVariables(data: SendEmailInputDto): SendEmailVariablesDto {
    const mailgunConfig = getMailgunConfig(this.baConfigService)
    const response: SendEmailVariablesDto = {}
    Object.entries(mailgunConfig[data.template].variables).forEach(
      ([key, val]) => {
        switch (val.type) {
          case MailgunConfigVariableType.PARAMETER: {
            const base =
              response[key as keyof SendEmailVariablesDto] || val.value
            let baseStr = String(base)
            Object.entries(data.data).forEach(([k, v]) => {
              if (v) {
                baseStr = baseStr.replace(`{{${k}}}`, v.toString())
              }
            })
            response[key as keyof SendEmailVariablesDto] = baseStr
            break
          }

          case MailgunConfigVariableType.SELECT:
            if (
              typeof val.value === 'object' &&
              Object.prototype.hasOwnProperty.call(val.value, data.data.slug)
            ) {
              response[key as keyof SendEmailVariablesDto] =
                val.value?.[data.data.slug as keyof typeof val.value]
            }

            break

          case MailgunConfigVariableType.STRING:
            response[key as keyof SendEmailVariablesDto] = val.value
              ? // eslint-disable-next-line @typescript-eslint/no-base-to-string
                val.value.toString()
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
      this.baConfigService.mailgun.domain,
      templateName,
      { active: 'yes' } as TemplateQuery, // There is an error when importing mailgun.js/Enums, thus this is needed
    )

    if (!response.version?.template) {
      throw this.throwerErrorGuard.NotFoundException(
        MailgunErrorsEnum.TEMPLATE_NOT_FOUND,
        `${MailgunErrorsResponseEnum.TEMPLATE_NOT_FOUND}: ${templateName}`,
      )
    }

    const compiledTemplate = Handlebars.compile(response.version.template)
    return compiledTemplate(variables)
  }
}

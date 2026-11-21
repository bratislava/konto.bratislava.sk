import { ErrorFactoryService } from '@bratislava/log-nest'
import { Injectable } from '@nestjs/common'
import FormData from 'form-data'
import { MailgunTemplateEnum } from 'forms-shared/definitions/emailFormTypes'
import Handlebars from 'handlebars'
import Mailgun from 'mailgun.js'
import { Enums, Interfaces } from 'mailgun.js/definitions'

import BaConfigService from '../../config/ba-config.service'
import StrapiService from '../../strapi/strapi.service'
import {
  SendEmailDataDto,
  SendEmailInputDto,
  SendEmailVariablesDto,
} from '../../utils/global-dtos/mailgun.dto'
import {
  MailgunErrorsEnum,
  MailgunErrorsResponseEnum,
} from '../../utils/global-enums/mailgun.errors.enum'
import {
  getMailgunConfig,
  MailgunConfig,
  MailgunConfigVariable,
  MailgunConfigVariableType,
} from '../mailgun.constants'

@Injectable()
export default class MailgunHelper {
  readonly mailgunClient: Interfaces.IMailgunClient

  readonly templateConfigs: Record<MailgunTemplateEnum, MailgunConfig>

  constructor(
    private readonly errorFactoryService: ErrorFactoryService,
    private readonly baConfigService: BaConfigService,
    private readonly strapiService: StrapiService,
  ) {
    const mailgun = new Mailgun(FormData)
    this.mailgunClient = mailgun.client({
      username: 'api',
      key: this.baConfigService.mailgun.apiKey,
      url: this.baConfigService.mailgun.host,
    })
    this.templateConfigs = getMailgunConfig(this.baConfigService)
  }

  async createEmailVariables(
    input: SendEmailInputDto,
  ): Promise<SendEmailVariablesDto> {
    const { variables } = this.templateConfigs[input.template]
    const resolvedVariables = await Promise.all(
      Object.entries(variables).map(
        async ([key, variable]) =>
          [key, await this.resolveVariable(variable, input.data)] as const,
      ),
    )
    return Object.fromEntries(resolvedVariables)
  }

  private async resolveVariable(
    variable: MailgunConfigVariable,
    data: SendEmailDataDto,
  ): Promise<string | undefined> {
    switch (variable.type) {
      case MailgunConfigVariableType.PARAMETER:
        return variable.getValue(data) || undefined

      case MailgunConfigVariableType.STRING:
        return variable.value

      case MailgunConfigVariableType.FEEDBACK_LINK: {
        const feedbackLink = await this.strapiService.getFeedbackLink(data.slug)
        return feedbackLink || undefined
      }

      default:
        return variable satisfies never
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
    const response = await this.mailgunClient.domains.domainTemplates.get(
      this.baConfigService.mailgun.domain,
      templateName,
      { active: Enums.YesNo.YES },
    )

    if (!response.version?.template) {
      throw this.errorFactoryService.NotFoundException({
        errorEnum: MailgunErrorsEnum.TEMPLATE_NOT_FOUND,
        message: `${MailgunErrorsResponseEnum.TEMPLATE_NOT_FOUND}: ${templateName}`,
      })
    }

    const compiledTemplate = Handlebars.compile(response.version.template)
    return compiledTemplate(variables)
  }
}

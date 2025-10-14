import { Injectable } from '@nestjs/common'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { Interfaces } from 'mailgun.js/definitions'

const mailgun = new Mailgun(formData)

import { MailgunTemplateParams, MailgunTemplates } from '../utils/global-dtos/mailgun.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MAILGUN } from '../user-verification/constants'

@Injectable()
export class MailgunService {
  private mg: Interfaces.IMailgunClient

  private readonly config

  private readonly logger: LineLoggerSubservice

  constructor() {
    // TODO temporarily uses dummy token which always passes
    if (!process.env.MAILGUN_API_KEY || !process.env.DEFAULT_MAILGUN_DOMAIN) {
      throw new Error('MailgunService ENV vars are not set.')
    }
    this.config = {
      defaultMailgunDomain: process.env.DEFAULT_MAILGUN_DOMAIN,
    }

    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: MAILGUN.API_URL,
    })
    this.logger = new LineLoggerSubservice(MailgunService.name)
    this.logger.log('Successfully initialized Mailgun')
  }

  // only throws if passed unserializable options
  // otherwise only prints warnings to console
  // we can use the logs to resend failed mails manually
  // TODO consider storing failed email options in DB / or an email scheduler
  async sendEmail<T extends keyof typeof MailgunTemplates>(
  async sendEmail<T extends keyof MailgunTemplateParams>(
    templateKey: T,
    options: MailgunTemplateParams[T]
  ) {
    try {
      const response = await this.mg.messages.create(
        this.config.defaultMailgunDomain,
        MailgunTemplates[templateKey](options)
      )
      this.logger.log('Mailgun email sent. response', { templateKey, options, response })
    } catch (error) {
      this.logger.error('WARNING - failed to send Mailgun email, with template', {
        templateKey,
        options,
        error,
      })
    }
  }
}

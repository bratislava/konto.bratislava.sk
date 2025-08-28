import { Injectable } from '@nestjs/common'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { Interfaces } from 'mailgun.js/definitions'

const mailgun = new Mailgun(formData)

import { MailgunTemplates } from '../global-dtos/mailgun.dto'
import { LineLoggerSubservice } from './line-logger.subservice'
import { MAILGUN } from '../../user-verification/constants'

@Injectable()
export class MailgunSubservice {
  private mg: Interfaces.IMailgunClient

  private readonly config

  private readonly logger: LineLoggerSubservice

  constructor() {
    // TODO temporarily uses dummy token which always passes
    if (!process.env.MAILGUN_API_KEY || !process.env.DEFAULT_MAILGUN_DOMAIN) {
      throw new Error('MailgunSubservice ENV vars are not set.')
    }
    this.config = {
      defaultMailgunDomain: process.env.DEFAULT_MAILGUN_DOMAIN,
    }

    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: MAILGUN.API_URL,
    })
    this.logger = new LineLoggerSubservice(MailgunSubservice.name)
    this.logger.log('Successfully initialized Mailgun')
  }

  // only throws if passed unserializable options
  // otherwise only prints warnings to console
  // we can use the logs to resend failed mails manually
  // TODO consider storing failed email options in DB / or an email scheduler
  async sendEmail<T extends keyof typeof MailgunTemplates>(
    templateKey: T,
    options: Parameters<(typeof MailgunTemplates)[T]>[0]
  ) {
    try {
      this.logger.log(
        'About to send email with template',
        templateKey,
        'and options',
        JSON.stringify(options)
      )
      const response = await this.mg.messages.create(
        this.config.defaultMailgunDomain,
        MailgunTemplates[templateKey](options)
      )
      this.logger.log('Mailgun response', response)
    } catch (error) {
      this.logger.error(
        'WARNING - failed to send Mailgun email, with template',
        templateKey,
        'and options',
        JSON.stringify(options),
        '. Error:',
        error,
        '. Continuing with regular response'
      )
    }
  }
}

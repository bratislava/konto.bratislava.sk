import { Injectable } from '@nestjs/common'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { Interfaces } from 'mailgun.js/definitions'
import { MailgunMessageBuilder, MailgunTemplates } from './mailgun-message.builder'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MAILGUN } from '../user-verification/constants'

const mailgun = new Mailgun(formData)

@Injectable()
export class MailgunService {
  private mg: Interfaces.IMailgunClient

  private readonly config

  private readonly logger: LineLoggerSubservice

  constructor(private readonly mailgunMessageBuilder: MailgunMessageBuilder) {
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
    this.logger = new LineLoggerSubservice(MailgunService.name)
    this.logger.log('Successfully initialized Mailgun')
  }

  // only throws if passed unserializable options
  // otherwise only prints warnings to console
  // we can use the logs to resend failed mails manually
  // TODO consider storing failed email options in DB / or an email scheduler
  async sendEmail<T extends keyof MailgunTemplates>(
    templateKey: T,
    options: Parameters<MailgunTemplates[T]>[0]
  ) {
    try {
      this.logger.log(
        'About to send an email with template',
        templateKey,
        'and options',
        JSON.stringify(options)
      )

      // Use the injected factory instance to get the correct method
      // TypeScript cannot properly narrow down the union type when using dynamic property access with generics.
      // The type safety is preserved at the call site where sendEmail is invoked - the generic parameter T
      // ensures that the templateKey and options are correctly matched. The 'as any' here is safe because
      // we've already validated the types through the function signature.
      const factoryMethod = this.mailgunMessageBuilder[templateKey]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messageData = await factoryMethod.call(this.mailgunMessageBuilder, options as any)

      const response = await this.mg.messages.create(this.config.defaultMailgunDomain, messageData)
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

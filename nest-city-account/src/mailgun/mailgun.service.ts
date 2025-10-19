import { Injectable } from '@nestjs/common'
import formData from 'form-data'
import Mailgun from 'mailgun.js'
import { Interfaces } from 'mailgun.js/definitions'
import { MailgunTemplateParams, MailgunTemplates } from './dto/mailgun.dto'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { MAILGUN } from '../user-verification/constants'
import { PdfConverterService } from './pdf-converter/pdf-converter.service'
import { htmlContent } from './pdf-converter/templates/delivery-method-set-to-notification'
import * as fs from "node:fs";
import path from "node:path";
import * as os from "node:os";

const mailgun = new Mailgun(formData)

// Types for PDF functionality
export interface PdfTemplateData {
  [key: string]: any
}

export interface PdfGenerationFromMailgunOptions {
  password: string
  filename: string
  templateData: { firstName: string, lastName: string, birthNumber: string },
}

export interface EmailWithPdfOptions {
  to: string
  variables: {
    firstName: string
    lastName: string
  }
}

@Injectable()
export class MailgunService {
  private mg: Interfaces.IMailgunClient

  private readonly config

  private readonly logger: LineLoggerSubservice

  constructor(private readonly pdfConverterService: PdfConverterService) {
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

  /**
   * Complete workflow: Generate PDF from Mailgun template and send via email
   */
  async generateMailgunPdfAndSendEmail(
    pdfOptions: PdfGenerationFromMailgunOptions,
    emailOptions: EmailWithPdfOptions
  ): Promise<void> {
    // TODO use this instead if local html
    // const template = await this.mg.domains.domainTemplates.get(
    //   this.config.defaultMailgunDomain,
    //   'delivery-method-set-to-notification',
    //   { active: YesNo.YES }
    // )

    // Generate PDF from Mailgun template
    const pdfBuffer = await this.pdfConverterService.getPdfByTemplateName(
      /*TODO replace with a mailgun template*/ htmlContent,
      pdfOptions.password,
      pdfOptions.filename,
      {...emailOptions.variables, birthNumber: '1234567890'}
    )

    const tempFilePath = path.join(os.tmpdir(), `temp-${Date.now()}.pdf`)
    await fs.promises.writeFile(tempFilePath, pdfBuffer)

    this.logger.log(`file written to ${tempFilePath.toString()}`)


    await this.sendEmail('delivery-method-set-to-notification', {
      ...emailOptions,
      attachment: {
        data: pdfBuffer,
        filename: pdfOptions.filename ?? 'Žiadosť o súhlas s doručením oznámením.',
      },
      testMode: true,
    })
  }

  async sendEmail<T extends keyof MailgunTemplateParams>(
    templateKey: T,
    options: MailgunTemplateParams[T]
  ) {
    try {
      // const response = await this.mg.messages.create(
      //   this.config.defaultMailgunDomain,
      //   MailgunTemplates[templateKey](options)
      // )
      this.logger.log('Mailgun email sent. response', { templateKey, options, templateData: MailgunTemplates[templateKey](options) })
    } catch (error) {
      this.logger.error('WARNING - failed to send Mailgun email, with template', {
        templateKey,
        options,
        error,
      })
    }
  }
}

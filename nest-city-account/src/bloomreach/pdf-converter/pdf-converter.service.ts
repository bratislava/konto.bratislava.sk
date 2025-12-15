import { Injectable } from '@nestjs/common'
import { Browser, chromium } from 'playwright'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PDFDocument } from 'pdf-lib-with-encrypt'
import { PdfTemplateKeys, pdfTemplates, TemplateAttributes } from './templates/pdf-templates'

@Injectable()
export class PdfConverterService {
  private readonly logger: LineLoggerSubservice

  constructor() {
    this.logger = new LineLoggerSubservice(PdfConverterService.name)
  }

  /**
   * Generates a password-protected PDF from a Mailgun template
   */
  async getPdfByTemplateName<T extends PdfTemplateKeys>(
    templateName: T,
    filename: string,
    htmlVariables: TemplateAttributes<T>,
    password?: string
  ): Promise<{ data: Buffer; filename: string; contentType: string }> {
    let browser: Browser | null = null

    const template = pdfTemplates[templateName]

    try {
      browser = await chromium.launch()
      const page = await browser.newPage()

      let htmlWithFilledOutVariables = template.html
      // Replace variables in html with `htmlVariables`
      Object.entries(htmlVariables).forEach(([key, value]) => {
        htmlWithFilledOutVariables = htmlWithFilledOutVariables.replace(
          `\{\{${key}\}\}`,
          value as string
        )
      })

      await page.setContent(htmlWithFilledOutVariables)

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm',
        },
      })

      await browser.close()
      browser = null

      if (password) {
        return {
          data: await this.addPasswordToPdf(pdfBuffer, password),
          filename,
          contentType: 'application/pdf',
        }
      }

      return {
        data: pdfBuffer,
        filename,
        contentType: 'application/pdf',
      }
    } catch (error) {
      if (browser) {
        await browser.close()
      }
      this.logger.error(`Error generating PDF from Mailgun template: ${error}`)
      throw error
    }
  }

  /**
   * Adds password protection to a PDF buffer using pdf-lib
   */
  private async addPasswordToPdf(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(pdfBuffer)

    // Set password protection
    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'lowResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      },
    })

    const protectedPdfBytes = await pdfDoc.save()
    return Buffer.from(protectedPdfBytes)
  }
}

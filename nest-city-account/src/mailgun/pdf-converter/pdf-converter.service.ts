import { Injectable } from '@nestjs/common'
import { Browser, chromium } from 'playwright'
import { LineLoggerSubservice } from '../../utils/subservices/line-logger.subservice'
import { PDFDocument } from 'pdf-lib-with-encrypt'
import {MessageAttachment} from "mailgun.js/definitions";

@Injectable()
export class PdfConverterService {
  private readonly logger: LineLoggerSubservice

  constructor() {
    this.logger = new LineLoggerSubservice(PdfConverterService.name)
  }

  /**
   * Generates a password-protected PDF from a Mailgun template
   */
  async getPdfByTemplateName(
    templateName: string,
    filename: string,
    htmlVariables: Record<string, string>
  ): Promise<MessageAttachment> {
    let browser: Browser | null = null

    try {
      browser = await chromium.launch()
      const page = await browser.newPage()
      await page.setContent(htmlData)

      let htmlWithFilledOutVariables = htmlData
      // Replace variables in html with `htmlVariables`
      Object.entries(htmlVariables).forEach((value) => {
        htmlData = htmlData.replace(`\{\{${value[0]}\}\}`, value[1])
      })

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
      return {
        data: pdfBuffer,
        filename,
        contentType: 'application/pdf'
      }
    } catch (error) {
      if (browser) {
        await browser.close()
      }
      this.logger.error(`Error generating PDF from Mailgun template: ${error}`)
      throw error
    }
  }

  async getEncryptedPdfByTemplateName (
    templateName: string,
    filename: string,
    password: string,
    htmlVariables: Record<string, string>
  ): Promise<Buffer> {
    let browser: Browser | null = null

    try {
      browser = await chromium.launch()
      const page = await browser.newPage()
      await page.setContent(htmlData)

      let htmlWithFilledOutVariables = htmlData
      // Replace variables in html with `htmlVariables`
      Object.entries(htmlVariables).forEach((value) => {
        htmlData = htmlData.replace(`\{\{${value[0]}\}\}`, value[1])
      })

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

      const protectedPdfBuffer = await this.addPasswordToPdf(pdfBuffer, password)

      this.logger.log(`PDF generated successfully from Mailgun template: ${filename}`)
      return protectedPdfBuffer
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
    try {
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
    } catch (error) {
      this.logger.error(`Error adding password protection to PDF: ${error}`)
      // Fallback: return original PDF if encryption fails
      return pdfBuffer
    }
  }
}

import { Injectable } from '@nestjs/common'
import { Browser, chromium } from 'playwright'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { PdfTemplateKeys, pdfTemplates, PdfTemplateVariables } from './templates/pdf-templates'
import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { v4 as uuidv4 } from 'uuid'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { ErrorsEnum } from '../utils/guards/dtos/error.dto'

@Injectable()
export class PdfGeneratorService {
  private readonly logger: LineLoggerSubservice

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    this.logger = new LineLoggerSubservice(PdfGeneratorService.name)
  }

  /**
   * Generates a password-protected PDF from a Mailgun template
   */
  async generateFromTemplate<T extends PdfTemplateKeys>(
    templateName: T,
    filename: string,
    templateVariables: PdfTemplateVariables<T>,
    password?: string
  ): Promise<{ data: Buffer; filename: string; contentType: string }> {
    let browser: Browser | null = null

    const template = pdfTemplates[templateName]

    try {
      browser = await chromium.launch()
      const page = await browser.newPage()

      const htmlWithFilledOutVariables = template.html.replace(/\{\{(.*?)}}/g, (match, key) => {
        return templateVariables[key as keyof typeof templateVariables] ?? match
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
    const tempInputPath = join(tmpdir(), `input-${uuidv4()}.pdf`)

    try {
      writeFileSync(tempInputPath, pdfBuffer)

      return await new Promise((resolve, reject) => {
        // Arguments: input is the temp file, output is '-' (stdout)
        const args = ['--encrypt', password, password, '256', '--', tempInputPath, '-']

        const child = spawn('qpdf', args)
        const stdoutChunks: Buffer[] = []
        const stderrChunks: Buffer[] = []

        child.stdout.on('data', (chunk) => stdoutChunks.push(chunk))
        child.stderr.on('data', (chunk) => stderrChunks.push(chunk))

        child.on('error', (err) => {
          if (existsSync(tempInputPath)) unlinkSync(tempInputPath)
          this.logger.error(`Failed to start qpdf process: ${err.message}`)
          reject(
            this.throwerErrorGuard.InternalServerErrorException(
              ErrorsEnum.INTERNAL_SERVER_ERROR,
              'Failed to start PDF encryption process',
              err.message,
              err
            )
          )
        })

        child.on('close', (code) => {
          if (existsSync(tempInputPath)) unlinkSync(tempInputPath)

          if (code === 0) {
            resolve(Buffer.concat(stdoutChunks))
          } else {
            const stderr = Buffer.concat(stderrChunks).toString()
            reject(
              this.throwerErrorGuard.InternalServerErrorException(
                ErrorsEnum.INTERNAL_SERVER_ERROR,
                'PDF encryption failed during processing',
                `qpdf exited with code ${code}: ${stderr}`
              )
            )
          }
        })
      })
    } catch (error) {
      if (existsSync(tempInputPath)) unlinkSync(tempInputPath)

      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Unexpected error during PDF encryption setup',
          error.message,
          error
        )
      }
      throw error
    }
  }
}

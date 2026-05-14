import { spawn } from 'node:child_process'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Injectable } from '@nestjs/common'
import { Browser, chromium } from 'playwright'
import { v4 as uuidv4 } from 'uuid'

import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { PdfTemplateKeys, pdfTemplates, PdfTemplateVariables } from './templates/pdf-templates'

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
    password: string
  ): Promise<{ data: Buffer; filename: string; contentType: string }> {
    let browser: Browser | null = null

    const template = pdfTemplates[templateName]

    try {
      browser = await chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      })
      const page = await browser.newPage()

      // Restrict to word chars (\\w+) to avoid ReDoS; template keys are identifiers only
      const htmlWithFilledOutVariables = template.html.replace(/\{\{(\w+)}}/g, (match, key) => {
        // Fallback to match when key is missing (e.g. template typo); runtime key may not exist
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- regex capture can be unknown key
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

      return {
        data: await this.addPasswordToPdf(pdfBuffer, password),
        filename,
        contentType: 'application/pdf',
      }
    } catch (error) {
      if (browser) {
        await browser.close()
      }

      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        'Error generating PDF from Mailgun template',
        error
      )
    }
  }

  /**
   * Adds password protection to a PDF buffer using pdf-lib
   */
  private async addPasswordToPdf(pdfBuffer: Buffer, password: string): Promise<Buffer> {
    const tempInputPath = join(tmpdir(), `input-${uuidv4()}.pdf`)

    try {
      writeFileSync(tempInputPath, pdfBuffer)

      return await new Promise<Buffer>((resolve, reject) => {
        const args = ['--encrypt', password, password, '256', '--', tempInputPath, '-']

        const child = spawn('qpdf', args)
        const stdoutChunks: Buffer[] = []
        const stderrChunks: Buffer[] = []

        child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk))
        child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk))

        child.on('error', (err) => {
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
      if (error instanceof Error) {
        throw this.throwerErrorGuard.InternalServerErrorException(
          ErrorsEnum.INTERNAL_SERVER_ERROR,
          'Unexpected error during PDF encryption setup',
          error.message,
          error
        )
      }
      throw error
    } finally {
      if (existsSync(tempInputPath)) {
        unlinkSync(tempInputPath)
      }
    }
  }
}

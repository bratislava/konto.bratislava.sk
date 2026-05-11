import { spawn } from 'node:child_process'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Injectable } from '@nestjs/common'
import { Browser, BrowserContext, chromium, Page } from 'playwright'
import { v4 as uuidv4 } from 'uuid'

import { ErrorsEnum, ErrorsResponseEnum } from '../utils/guards/dtos/error.dto'
import ThrowerErrorGuard from '../utils/guards/errors.guard'
import { LineLoggerSubservice } from '../utils/subservices/line-logger.subservice'
import { PdfTemplateKeys, pdfTemplates, PdfTemplateVariables } from './templates/pdf-templates'

@Injectable()
export class PdfGeneratorService {
  private readonly logger: LineLoggerSubservice

  private sharedBrowser: Browser | null = null

  private sharedBrowserRefCount = 0

  constructor(private readonly throwerErrorGuard: ThrowerErrorGuard) {
    this.logger = new LineLoggerSubservice(PdfGeneratorService.name)
  }

  /**
   * Opens a long-lived Chromium instance reused by subsequent generateFromTemplate calls.
   * Ref-counted so nested/concurrent callers share a single browser; pair with releaseSharedBrowser in a finally block.
   */
  async acquireSharedBrowser(): Promise<void> {
    this.sharedBrowserRefCount++
    if (this.sharedBrowserRefCount === 0) {
      this.sharedBrowser = await chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
      })
    }
  }

  async releaseSharedBrowser(): Promise<void> {
    if (this.sharedBrowserRefCount === 0) {
      return
    }
    this.sharedBrowserRefCount--
    if (this.sharedBrowserRefCount === 0 && this.sharedBrowser) {
      const browser = this.sharedBrowser
      this.sharedBrowser = null
      try {
        await browser.close()
      } catch (error) {
        this.logger.error('Failed to close shared Chromium browser', error)
      }
    }
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
    const template = pdfTemplates[templateName]

    let ownBrowser: Browser | null = null
    let pinnedSharedBrowser: Browser | null = null
    let context: BrowserContext | null = null
    let page: Page | null = null

    try {
      // the next 3 rows must be inside a synchronous block - never await between them
      if (this.sharedBrowser) {
        pinnedSharedBrowser = this.sharedBrowser
        this.sharedBrowserRefCount++
        // await allowed below

        context = await pinnedSharedBrowser.newContext()
        page = await context.newPage()
      } else {
        ownBrowser = await chromium.launch({
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
        })
        page = await ownBrowser.newPage()
      }

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

      return {
        data: await this.addPasswordToPdf(pdfBuffer, password),
        filename,
        contentType: 'application/pdf',
      }
    } catch (error) {
      throw this.throwerErrorGuard.InternalServerErrorException(
        ErrorsEnum.INTERNAL_SERVER_ERROR,
        ErrorsResponseEnum.INTERNAL_SERVER_ERROR,
        'Error generating PDF from Mailgun template',
        error
      )
    } finally {
      if (page) {
        await page.close().catch((err: unknown) => {
          this.logger.error('Failed to close page', err)
        })
      }
      if (context) {
        await context.close().catch((err: unknown) => {
          this.logger.error('Failed to close browser context', err)
        })
      }
      if (ownBrowser) {
        await ownBrowser.close().catch((err: unknown) => {
          this.logger.error('Failed to close per-call browser', err)
        })
      }
      if (pinnedSharedBrowser) {
        // Release our pin; this may close the shared browser if we were the last holder.
        await this.releaseSharedBrowser()
      }
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

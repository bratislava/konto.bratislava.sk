import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

import { environment } from '../../environment'
import { FormFileUploadClientFileInfo } from '../../frontend/types/formFileUploadTypes'
import type { PdfPreviewDataStoreUuidResponse } from './pdf-preview-data-store'

export type PdfPreviewPayload = {
  schema: RJSFSchema
  uiSchema: UiSchema
  formDataJson: GenericObjectType
  initialClientFiles: FormFileUploadClientFileInfo[]
  initialServerFiles: GetFileResponseDto[]
}

/**
 * Generates a PDF preview of a form by:
 * 1. Receiving the form data as a POST request.
 * 2. Storing the form data in a data store.
 * 3. Opening the `/pdf-preview/[uuid]` (which retrieves the data from the data store) page in a Puppeteer browser
 * 4. Rendering the page as a PDF and returning it as a response.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' })
  }

  const { schema, uiSchema, formDataJson, initialServerFiles, initialClientFiles } = (req.body ??
    {}) as Partial<PdfPreviewPayload>

  if (!schema || !uiSchema || !formDataJson || !initialClientFiles || !initialServerFiles) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  const [dataStoreResponse, browser] = await Promise.all([
    await axios.post<PdfPreviewDataStoreUuidResponse>(
      `${environment.selfUrl}/api/pdf-preview-data-store`,
      {
        schema,
        uiSchema,
        formDataJson,
        initialServerFiles,
        initialClientFiles,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ),
    puppeteer.launch({
      headless: 'new',
      // TODO: These are needed to run Puppeteer in a Docker container, however by running it as a non-default user, they
      // might not be needed.
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }),
  ])

  try {
    // Because Next behaves differently when running in dev mode, `setJavaScriptEnabled` must not be set to false and
    // `waitUntil` must be set to `networkidle0` to render properly.
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)

    const response = await page.goto(
      `${environment.selfUrl}/pdf-preview/${dataStoreResponse.data.uuid}`,
      {
        waitUntil: 'domcontentloaded',
      },
    )

    if (!response || response.status() !== 200) {
      throw new Error('Page failed to load.')
    }

    const formElement = await page.$('form')

    if (formElement === null) {
      throw new Error(`Form not found.`)
    }

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

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment')
    return res.send(pdfBuffer)
  } catch (error) {
    await browser.close()
    return res.status(500).json({ error: 'Error generating PDF' })
  }
}

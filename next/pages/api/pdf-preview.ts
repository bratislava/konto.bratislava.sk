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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure that we're dealing with a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' })
  }

  const { schema, uiSchema, formDataJson, initialServerFiles, initialClientFiles } =
    req.body as PdfPreviewPayload

  // Ensure the body contains the required schema, uiSchema, and formDataJson properties
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
      // `https://city-account-next.dev.bratislava.sk/pdf-preview/91a9dc6b-4f9a-4f9f-82ec-55756c3cb693`,
      {
        waitUntil: 'domcontentloaded', // wait for page to load completely
      },
    )

    if (!response || response.status() !== 200) {
      throw new Error('Page failed to load.')
    }

    const element = await page.$('form')

    // If the element is not found, throw an error
    if (element === null) {
      throw new Error(`Form not found.`)
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        // Word's default A4 margins
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

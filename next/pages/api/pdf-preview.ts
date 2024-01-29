import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

import { environment } from '../../environment'
import { FormFileUploadClientFileInfo } from '../../frontend/types/formFileUploadTypes'

export type PdfPreviewPayload = {
  schema: RJSFSchema
  uiSchema: UiSchema
  formDataJson: GenericObjectType
  initialClientFiles: Omit<FormFileUploadClientFileInfo, 'file'>[]
  initialServerFiles: GetFileResponseDto[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure that we're dealing with a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' })
  }

  // Ensure the body contains the required schema, uiSchema, and formDataJson properties
  if (
    !req.body ||
    !req.body.schema ||
    !req.body.uiSchema ||
    !req.body.formDataJson ||
    !req.body.initialClientFiles ||
    !req.body.initialServerFiles
  ) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }

  let x = performance.now()
  // Extract the relevant data from the request body
  const { schema, uiSchema, formDataJson, initialServerFiles, initialClientFiles } = req.body
  const response = await fetch(`${environment.selfUrl}/api/pdf-preview-data-store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schema,
      uiSchema,
      formDataJson,
      initialServerFiles,
      initialClientFiles,
    }),
  })
  console.log('fetch', performance.now() - x)
  x = performance.now()
  const { uuid } = await response.json()

  const browser = await puppeteer.launch({
    headless: 'new',
  })

  try {
    const page = await browser.newPage()

    const response = await page.goto(`${environment.selfUrl}/pdf-preview/${uuid}`, {
      waitUntil: 'networkidle0', // wait for page to load completely
    })

    if (!response || response.status() !== 200) {
      throw new Error('Page failed to load.')
    }

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        // Word's default A4 margins
        top: '2.54cm',
        bottom: '2.54cm',
        left: '2.54cm',
        right: '2.54cm',
      },
    })

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=preview.pdf')
    res.send(pdfBuffer)
  } catch (error) {
    await browser.close()
    res.status(500).json({ error: 'Error generating PDF' })
  }
}

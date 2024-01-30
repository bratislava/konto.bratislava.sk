import { GetFileResponseDto } from '@clients/openapi-forms'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'
import { v4 as uuidv4 } from 'uuid'

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
  const generatedUuid = uuidv4()
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

  console.log(generatedUuid, 'before fetch')
  // Extract the relevant data from the request body
  const dataStoreResponse = await fetch(`${environment.selfUrl}/api/pdf-preview-data-store`, {
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

  const [{ uuid }, browser] = await Promise.all([
    dataStoreResponse.json(),
    puppeteer.launch({
      headless: 'new',
    }),
  ])
  console.log(generatedUuid, 'after fetch')

  try {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)
    console.log(generatedUuid, 'after newPage')

    const response = await page.goto(`${environment.selfUrl}/pdf-preview/${uuid}`, {
      waitUntil: 'domcontentloaded', // wait for page to load completely
    })
    console.log(generatedUuid, 'after goto')

    if (!response || response.status() !== 200) {
      throw new Error('Page failed to load.')
    }

    console.log(generatedUuid, 'after if')
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
    console.log(generatedUuid, 'after pdfBuffer')

    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=preview.pdf')
    console.log(generatedUuid, 'before send')
    return res.send(pdfBuffer)
  } catch (error) {
    console.error(error)
    await browser.close()
    return res.status(500).json({ error: 'Error generating PDF' })
  }
}

import React from 'react'
import { chromium } from 'playwright'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { renderToString } from 'react-dom/server'
import { getTailwindCss } from './tailwindCss'
import { SummaryPdf } from './SummaryPdf'
import { getInterCss } from './interCss'

/**
 * Renders a summary PDF from the given JSON schema, UI schema and data.
 *
 * TODO: Not production ready:
 *  - Visually not completed.
 *  - Files are not supported (only id is displayed).
 *  - Errors are not displayed.
 */
export const renderSummaryPdf = async (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  data: GenericObjectType,
) => {
  const cssArray = await Promise.all([getTailwindCss(), getInterCss()])
  const cssToInject = cssArray.join('\n')
  const summaryJson = getSummaryJsonNode(jsonSchema, uiSchema, data)

  const renderedString = renderToString(
    <SummaryPdf cssToInject={cssToInject} summaryJson={summaryJson}></SummaryPdf>,
  )
  const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN })

  try {
    const page = await browser.newPage()
    await page.setContent(renderedString)

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
    return pdfBuffer
  } catch (error) {
    await browser.close()
    throw error
  }
}

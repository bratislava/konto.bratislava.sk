import React from 'react'
import { chromium } from 'playwright'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { renderToString } from 'react-dom/server'
import { getTailwindCss } from './tailwind'
import { SummaryPdf } from './SummaryPdf'

// Function to convert the rendered HTML string to a PDF using Playwright
export const renderSummaryPdf = async (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  data: GenericObjectType,
) => {
  const tailwindCss = await getTailwindCss()
  const summaryJson = getSummaryJsonNode(jsonSchema, uiSchema, data)

  const string = renderToString(
    <SummaryPdf tailwindCss={tailwindCss} summaryJson={summaryJson}></SummaryPdf>,
  )
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(string)
  await page.waitForLoadState('domcontentloaded')
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
}

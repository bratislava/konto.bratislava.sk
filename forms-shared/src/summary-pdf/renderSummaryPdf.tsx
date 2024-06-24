import React from 'react'
import { chromium } from 'playwright'
import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { renderToString } from 'react-dom/server'
import { SummaryPdf } from './SummaryPdf'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { ClientFileInfo } from '../form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { validateSummary } from '../summary-renderer/validateSummary'
import summaryPdfCss from '../generated-assets/summaryPdfCss'

/**
 * Renders a summary PDF from the given JSON schema, UI schema and data.
 */
export const renderSummaryPdf = async (
  jsonSchema: RJSFSchema,
  uiSchema: UiSchema,
  formData: GenericObjectType,
  serverFiles: FormsBackendFile[] = [],
  clientFiles: ClientFileInfo[] = [],
) => {
  const summaryJson = getSummaryJsonNode(jsonSchema, uiSchema, formData)

  const fileInfos = mergeClientAndServerFilesSummary(clientFiles, serverFiles)
  const validatedSummary = validateSummary(jsonSchema, formData, fileInfos)

  const renderedString = renderToString(
    <SummaryPdf
      cssToInject={summaryPdfCss.toString()}
      summaryJson={summaryJson}
      validatedSummary={validatedSummary}
    ></SummaryPdf>,
  )
  const browser = await chromium.launch()

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

import React from 'react'
import type { Browser } from 'playwright'
import { GenericObjectType } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { renderToString } from 'react-dom/server'
import { SummaryPdf } from './SummaryPdf'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { ClientFileInfo } from '../form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { validateSummary } from '../summary-renderer/validateSummary'
import summaryPdfCss from '../generated-assets/summaryPdfCss'
import { FormDefinition } from '../definitions/formDefinitionTypes'

export type RenderSummaryPdfPayload = {
  formDefinition: FormDefinition
  formData: GenericObjectType
  /**
   * Playwright must be installed and managed by the consumer of this function (e.g. in Docker) to run correctly, and is
   * only a peer dependency of this package.
   */
  launchBrowser: () => Promise<Browser>
  serverFiles?: FormsBackendFile[]
  clientFiles?: ClientFileInfo[]
}

/**
 * Renders a summary PDF from the given JSON schema, UI schema and data.
 */
export const renderSummaryPdf = async ({
  formDefinition,
  formData,
  launchBrowser,
  clientFiles,
  serverFiles,
}: RenderSummaryPdfPayload) => {
  const { schema, uiSchema } = formDefinition.schemas
  const summaryJson = getSummaryJsonNode(schema, uiSchema, formData)

  const fileInfos = mergeClientAndServerFilesSummary(clientFiles, serverFiles)
  const validatedSummary = validateSummary(schema, formData, fileInfos)

  const renderedString = renderToString(
    <SummaryPdf
      formDefinition={formDefinition}
      cssToInject={summaryPdfCss.toString()}
      summaryJson={summaryJson}
      validatedSummary={validatedSummary}
      formData={formData}
    ></SummaryPdf>,
  )
  const browser = await launchBrowser()

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

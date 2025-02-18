import React from 'react'
import type { Browser } from 'playwright'
import { renderToString } from 'react-dom/server'
import { SummaryPdf } from './SummaryPdf'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { ClientFileInfo } from '../form-files/fileStatus'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import summaryPdfCss from '../generated-assets/summaryPdfCss'
import { FormSummary } from '../summary/summary'
import { GenericObjectType, ValidationData } from '@rjsf/utils'

export type RenderSummaryPdfPayload = {
  formSummary: FormSummary
  validationData?: ValidationData<GenericObjectType>
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
  formSummary,
  validationData,
  launchBrowser,
  clientFiles,
  serverFiles,
}: RenderSummaryPdfPayload) => {
  const fileInfos = mergeClientAndServerFilesSummary(clientFiles, serverFiles)

  const renderedString = renderToString(
    <SummaryPdf
      formSummary={formSummary}
      validationData={validationData}
      cssToInject={summaryPdfCss.toString()}
      fileInfos={fileInfos}
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

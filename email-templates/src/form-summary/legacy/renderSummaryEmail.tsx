import React from 'react'
import { render } from 'react-email'

import { mergeClientAndServerFilesSummary } from 'forms-shared/form-files/mergeClientAndServerFiles'
import type { FormsBackendFile } from 'forms-shared/form-files/serverFilesTypes'
import type { BaRjsfValidatorRegistry } from 'forms-shared/form-utils/validatorRegistry'
import type { FormSummary } from 'forms-shared/summary/summary'

import { SummaryEmail } from './SummaryEmail'

export type FileIdInfoMap = Record<string, { url: string; fileName: string }>

export type RenderSummaryEmailPayload = {
  formSummary: FormSummary
  fileIdInfoMap: FileIdInfoMap
  validatorRegistry: BaRjsfValidatorRegistry
  serverFiles?: FormsBackendFile[]
  withHtmlBodyTags?: boolean
}

export const renderSummaryEmail = async ({
  formSummary,
  fileIdInfoMap,
  serverFiles,
  withHtmlBodyTags = false,
}: RenderSummaryEmailPayload) => {
  const fileInfos = mergeClientAndServerFilesSummary([], serverFiles)

  // `render()` always prepends an XHTML `<!DOCTYPE …>`, also for fragments (`withHtmlBodyTags`
  // false), so production emails carry it inside the Mailgun template's <body>. It was harmless in
  // every client tested.
  return render(
    <SummaryEmail
      formSummary={formSummary}
      fileInfos={fileInfos}
      fileIdInfoMap={fileIdInfoMap}
      withHtmlBodyTags={withHtmlBodyTags}
    ></SummaryEmail>,
  )
}

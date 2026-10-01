import { render } from '@react-email/components'
import React from 'react'

import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'
import { FormSummary } from '../summary/summary'
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

  return render(
    <SummaryEmail
      formSummary={formSummary}
      fileInfos={fileInfos}
      fileIdInfoMap={fileIdInfoMap}
      withHtmlBodyTags={withHtmlBodyTags}
    ></SummaryEmail>,
  )
}

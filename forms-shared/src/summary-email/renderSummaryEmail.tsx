import React from 'react'
import { GenericObjectType } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { validateSummary } from '../summary-renderer/validateSummary'
import { render } from '@react-email/components'
import { SummaryEmail } from './SummaryEmail'
import { FormDefinition } from '../definitions/formDefinitionTypes'

export type RenderSummaryEmailFileIdInfoMap = Record<string, { url: string; fileName: string }>

export type RenderSummaryEmailPayload = {
  formDefinition: FormDefinition
  formData: GenericObjectType
  fileIdUrlMap: RenderSummaryEmailFileIdInfoMap
  serverFiles?: FormsBackendFile[]
  withHtmlBodyTags?: boolean
}

export const renderSummaryEmail = async ({
  formDefinition,
  formData,
  fileIdUrlMap,
  serverFiles,
  withHtmlBodyTags = false,
}: RenderSummaryEmailPayload) => {
  const summaryJson = getSummaryJsonNode(
    formDefinition.schemas.schema,
    formDefinition.schemas.uiSchema,
    formData,
  )
  const fileInfos = mergeClientAndServerFilesSummary([], serverFiles)
  const validatedSummary = validateSummary(formDefinition.schemas.schema, formData, fileInfos)

  return render(
    <SummaryEmail
      summaryJson={summaryJson}
      validatedSummary={validatedSummary}
      fileIdUrlMap={fileIdUrlMap}
      withHtmlBodyTags={withHtmlBodyTags}
    ></SummaryEmail>,
  )
}

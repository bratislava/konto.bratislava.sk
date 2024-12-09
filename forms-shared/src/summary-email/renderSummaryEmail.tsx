import React from 'react'
import { GenericObjectType } from '@rjsf/utils'
import { getSummaryJsonNode } from '../summary-json/getSummaryJsonNode'
import { FormsBackendFile } from '../form-files/serverFilesTypes'
import { mergeClientAndServerFilesSummary } from '../form-files/mergeClientAndServerFiles'
import { validateSummary } from '../summary-renderer/validateSummary'
import { render } from '@react-email/components'
import { SummaryEmail } from './SummaryEmail'
import { FormDefinition } from '../definitions/formDefinitionTypes'
import { BaRjsfValidatorRegistry } from '../form-utils/validatorRegistry'

export type FileIdInfoMap = Record<string, { url: string; fileName: string }>

export type RenderSummaryEmailPayload = {
  formDefinition: FormDefinition
  formData: GenericObjectType
  fileIdInfoMap: FileIdInfoMap
  validatorRegistry: BaRjsfValidatorRegistry
  serverFiles?: FormsBackendFile[]
  withHtmlBodyTags?: boolean
}

export const renderSummaryEmail = async ({
  formDefinition,
  formData,
  fileIdInfoMap,
  validatorRegistry,
  serverFiles,
  withHtmlBodyTags = false,
}: RenderSummaryEmailPayload) => {
  const summaryJson = getSummaryJsonNode(formDefinition.schema, formData, validatorRegistry)
  const fileInfos = mergeClientAndServerFilesSummary([], serverFiles)
  const validatedSummary = validateSummary(
    formDefinition.schema,
    formData,
    fileInfos,
    validatorRegistry,
  )

  return render(
    <SummaryEmail
      summaryJson={summaryJson}
      validatedSummary={validatedSummary}
      fileIdInfoMap={fileIdInfoMap}
      withHtmlBodyTags={withHtmlBodyTags}
    ></SummaryEmail>,
  )
}

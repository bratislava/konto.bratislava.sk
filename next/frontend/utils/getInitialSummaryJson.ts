import { ParsedUrlQuery } from 'node:querystring'

import { GenericObjectType } from '@rjsf/utils'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getSummaryJsonNode } from 'forms-shared/summary-json/getSummaryJsonNode'

import { STEP_QUERY_PARAM } from '../../components/forms/useFormCurrentStepIndex'
import { SUMMARY_QUERY_PARAM } from './formState'

export const getInitialSummaryJson = (
  query: ParsedUrlQuery,
  formDefinition: FormDefinition,
  formData: GenericObjectType,
) => {
  if (query[STEP_QUERY_PARAM] !== SUMMARY_QUERY_PARAM) {
    return null
  }

  return getSummaryJsonNode(
    formDefinition.schemas.schema,
    formDefinition.schemas.uiSchema,
    formData,
  )
}

import { ParsedUrlQuery } from 'node:querystring'

import { GenericObjectType } from '@rjsf/utils'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { getSummaryJsonNode } from 'forms-shared/summary-json/getSummaryJsonNode'

import { STEP_QUERY_PARAM_KEY } from '../../components/forms/useFormCurrentStepIndex'
import { STEP_QUERY_PARAM_VALUE_SUMMARY } from './formState'

export const getInitialSummaryJson = (
  query: ParsedUrlQuery,
  formDefinition: FormDefinition,
  formData: GenericObjectType,
) => {
  // Getting the summary JSON is expensive, therefore it is worth checking if it is actually needed.
  if (query[STEP_QUERY_PARAM_KEY] !== STEP_QUERY_PARAM_VALUE_SUMMARY) {
    return null
  }

  return getSummaryJsonNode(
    formDefinition.schemas.schema,
    formDefinition.schemas.uiSchema,
    formData,
  )
}
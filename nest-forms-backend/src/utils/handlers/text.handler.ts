import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { BAJSONSchema7 } from 'forms-shared/form-utils/ajvKeywords'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'

import { FormWithSelectedProperties } from '../types/prisma'

export const getSubjectTextFromForm = (
  data: FormWithSelectedProperties,
  formDefinition: FormDefinition,
): string => {
  if (!formDefinition.messageSubjectFormat) {
    return formDefinition.messageSubjectDefault
  }

  return formDefinition.messageSubjectFormat.replaceAll(
    /{([^}]+)}/g,
    (match) => {
      const atPath = get(data.formDataJson, match.slice(1, -1), '')
      // eslint-disable-next-line lodash-fp/no-extraneous-function-wrapping
      if (isArray(atPath) && atPath.every((elem) => isString(elem))) {
        return atPath.join(', ')
      }
      return isString(atPath) ? atPath : ''
    },
  )
}

export const getFrontendFormTitleFromForm = (
  data: FormWithSelectedProperties,
  formDefinition: FormDefinition,
): string | null => {
  type MinimalUiSchema = {
    'ui:options'?: {
      titlePath?: string
      titleFallback?: string
    }
  }
  const uiOptions = (
    (formDefinition.schema as BAJSONSchema7).baUiSchema as MinimalUiSchema
  )?.['ui:options']
  return (
    (get(
      data.formDataJson,
      uiOptions?.titlePath && typeof uiOptions.titlePath === 'string'
        ? uiOptions.titlePath
        : '__INVALID_PATH__',
    ) as string | undefined) ||
    uiOptions?.titleFallback ||
    null
  )
}

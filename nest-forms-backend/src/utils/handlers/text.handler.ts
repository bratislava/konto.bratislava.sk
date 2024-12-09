import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { BAJSONSchema7 } from 'forms-shared/form-utils/ajvKeywords'
import lodash from 'lodash'

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
      const atPath = lodash.get(data.formDataJson, match.slice(1, -1), '')
      if (
        lodash.isArray(atPath) &&
        atPath.every((elem) => lodash.isString(elem))
      ) {
        return atPath.join(', ')
      }
      return lodash.isString(atPath) ? atPath : ''
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
    (lodash.get(
      data.formDataJson,
      uiOptions?.titlePath && typeof uiOptions.titlePath === 'string'
        ? uiOptions.titlePath
        : '__INVALID_PATH__',
    ) as string | undefined) ||
    uiOptions?.titleFallback ||
    null
  )
}

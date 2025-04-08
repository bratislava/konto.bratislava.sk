import { GenericObjectType } from '@rjsf/utils'
import { FormDefinition } from 'forms-shared/definitions/formDefinitionTypes'
import { BAJSONSchema7 } from 'forms-shared/form-utils/ajvKeywords'
import { esbsKatastralneUzemiaCiselnik } from 'forms-shared/tax-form/mapping/shared/esbsCiselniky'
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import isString from 'lodash/isString'

import { FormWithSelectedProperties } from '../types/prisma'

const isPatchDataType = (
  formDataJson: GenericObjectType,
): formDataJson is {
  stavba: { katastralneUzemia: string[] }
} => {
  const katastralneUzemia = formDataJson?.stavba?.katastralneUzemia
  return (
    isArray(katastralneUzemia) &&
    // eslint-disable-next-line unicorn/no-array-callback-reference
    katastralneUzemia.every(isString)
  )
}

/**
 * Very temporary fix until https://github.com/bratislava/private-konto.bratislava.sk/issues/859 is resolved.
 */
const patchFormDataIfNeeded = (
  formDataJson: GenericObjectType | null,
  formDefinition: FormDefinition,
): GenericObjectType | null => {
  if (formDataJson == null) {
    return null
  }

  const isSurForm =
    formDefinition.slug === 'stanovisko-k-investicnemu-zameru' ||
    formDefinition.slug === 'zavazne-stanovisko-k-investicnej-cinnosti'
  if (isSurForm && isPatchDataType(formDataJson)) {
    const clonedData = structuredClone(formDataJson)
    clonedData.stavba.katastralneUzemia =
      clonedData.stavba.katastralneUzemia.map((uzemie) => {
        const ciselnikEntry = esbsKatastralneUzemiaCiselnik.find(
          ({ Code }) => Code === uzemie,
        )
        if (ciselnikEntry) {
          return ciselnikEntry.Name
        }

        return uzemie
      })

    return clonedData as GenericObjectType
  }

  return formDataJson
}

export const getSubjectTextFromForm = (
  data: FormWithSelectedProperties,
  formDefinition: FormDefinition,
): string => {
  if (!formDefinition.messageSubjectFormat || data.formDataJson == null) {
    return formDefinition.messageSubjectDefault
  }

  const patchedFormData = patchFormDataIfNeeded(
    data.formDataJson,
    formDefinition,
  )

  return formDefinition.messageSubjectFormat.replaceAll(
    /{([^}]+)}/g,
    (match) => {
      const atPath = get(patchedFormData, match.slice(1, -1), '')
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

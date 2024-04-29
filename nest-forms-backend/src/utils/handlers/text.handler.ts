import lodash from 'lodash'

import {
  FormWithSchemaAndVersion,
  FormWithSchemaVersionAndFiles,
  FormWithSelectedProperties,
} from '../types/prisma'

export const getSubjectTextFromForm = (
  data:
    | FormWithSchemaAndVersion
    | FormWithSchemaVersionAndFiles
    | FormWithSelectedProperties,
): string => {
  if (!data.schemaVersion.messageSubjectFormat) {
    return data.schemaVersion.schema.messageSubject
  }

  return data.schemaVersion.messageSubjectFormat.replaceAll(
    /{([^}]+)}/g,
    (match) => {
      const atPath = lodash.get(data.formDataJson, match.slice(1, -1), '???')
      if (
        lodash.isArray(atPath) &&
        atPath.every((elem) => lodash.isString(elem))
      ) {
        return atPath.join(', ')
      }
      return lodash.isString(atPath) ? atPath : '???'
    },
  )
}

export const getFrontendFormTitleFromForm = (
  data: FormWithSchemaAndVersion | FormWithSelectedProperties,
): string | null => {
  type MinimalUiSchema = {
    'ui:options'?: {
      titlePath?: string
      titleFallback?: string
    }
  }
  const uiOptions = (data.schemaVersion?.uiSchema as MinimalUiSchema)?.[
    'ui:options'
  ]
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

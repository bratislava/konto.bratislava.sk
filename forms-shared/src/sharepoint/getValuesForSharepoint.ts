import { SharepointData } from '../definitions/sharepointTypes'
import { get as lodashGet, isObject, isArray } from 'lodash'
import { JsonValue } from './types'

/**
 * Maps columns to their respective fields in SharePoint and fills them with data.
 *
 * @param {SharepointData} sharepointData - Object containing needed information to fill in the SharePoint table.
 * @param form - Form object containing the form data.
 * @param {JsonValue} jsonData - JSON data to use for filling the fields.
 * @param {Record<string, string>} fields - Mapping from the displayed name of the column in SharePoint to the API name.
 * @returns {Record<string, any>} - Object mapping API fields to their respective values.
 */
export const getValuesForFields = (
  sharepointData: SharepointData,
  form: {
    ginisDocumentId: string | null
    formDefinitionSlug: string
    title: string
  },
  jsonData: JsonValue,
  fields: Record<string, string>,
): Record<string, any> => {
  const result: Record<string, any> = {}
  Object.keys(fields).forEach((key) => {
    if (sharepointData.columnMap[key]) {
      const mapRecord = sharepointData.columnMap[key]
      switch (mapRecord.type) {
        case 'json_path':
          const valueAtJsonPath = getValueAtJsonPath(jsonData, mapRecord.info)
          if (valueAtJsonPath === null) {
            break
          }

          result[fields[key]] = valueAtJsonPath
          break

        case 'mag_number':
          result[fields[key]] = form.ginisDocumentId ?? ''
          break

        case 'title':
          result[fields[key]] = form.title
          break

        default:
          throw new TypeError(`Type provided in columnMap in sharepoint data is unknown.`)
      }
    } else {
      throw new Error(
        `Provided key ${key} not found in column map or extra keys. Slug: ${form.formDefinitionSlug}.`,
      )
    }
  })

  return result
}

export const getValueAtJsonPath = (jsonFormData: JsonValue, info: string): JsonValue => {
  let atPath: JsonValue = lodashGet(jsonFormData, info, null) as JsonValue

  if (isObject(atPath) && !isArray(atPath)) {
    throw new TypeError(
      `Only primitive types, and arrays of them can be retrieved. Retrieved: json object at path: ${info}.`,
    )
  }

  if (isArray(atPath)) {
    if (atPath.some((item) => isObject(item))) {
      throw new TypeError(
        `Only primitive types, and arrays of them can be retrieved. Retrieved: array of non-primitives at path: ${info}.`,
      )
    }
    atPath = atPath.map(String).join(', ')
  }
  return atPath
}

export const getArrayForOneToMany = (
  form: {
    jsonDataExtraDataOmitted: JsonValue
    id: string
  },
  path: string,
): Array<JsonValue> => {
  const atPath = lodashGet(form.jsonDataExtraDataOmitted, path, [])
  if (!Array.isArray(atPath)) {
    throw new TypeError(
      `Getting array data for oneToMany in form ${form.id} on path ${path} did not return array. Instead got value: ${atPath}`,
    )
  }
  return atPath
}

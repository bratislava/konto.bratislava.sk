import { GenericObjectType } from '@rjsf/utils'
import { BAJSONSchema7 } from './ajvKeywords'
import { getBaRjsfValidator } from './validators'

type ExtractFn<FormDataType extends GenericObjectType> = (formData: FormDataType) => string

/**
 * Data extractors with schema should be called before the data are validated with form schema
 * (e.g. when displaying form subject in list of forms). The `schema` is validated and upon
 * success the form data are extracted. The extraction function relies on the schema validation,
 * the extraction should never fail or return `undefined` (in that case the function throws an error).
 */
export type SchemaFormDataExtractor<FormDataType extends GenericObjectType> = {
  type: 'schema'
  extractFn: ExtractFn<FormDataType>
  schema: BAJSONSchema7
  schemaValidationFailedFallback?: string
}

/**
 * Data extractors without schema should be called after the data are validated with form schema
 * (e.g. when assigning subject to Ginis, extracting email from form data). The extraction function
 * relies on the fact the data are already validated, the extraction should never fail or return
 * `undefined` (in that case the function throws an error).
 */
export type SchemalessFormDataExtractor<FormDataType extends GenericObjectType> = {
  type: 'schemaless'
  extractFn: ExtractFn<FormDataType>
}

export function evaluateFormDataExtractor<FormDataType extends GenericObjectType>(
  extractor: SchemalessFormDataExtractor<FormDataType>,
  formData: GenericObjectType,
): string
export function evaluateFormDataExtractor<FormDataType extends GenericObjectType>(
  extractor: SchemaFormDataExtractor<FormDataType>,
  formData: GenericObjectType,
  schemaValidationFailedParentFallback: string,
): string
export function evaluateFormDataExtractor<FormDataType extends GenericObjectType>(
  extractor: SchemalessFormDataExtractor<FormDataType> | SchemaFormDataExtractor<FormDataType>,
  formData: GenericObjectType,
  schemaValidationFailedParentFallback?: string,
): string {
  if (extractor.type === 'schema') {
    const { schema, extractFn, schemaValidationFailedFallback } = extractor
    const validator = getBaRjsfValidator()

    if (validator.isValid(schema, formData, schema)) {
      const result = extractFn(formData as FormDataType)
      if (result == null) {
        throw new Error(
          `Extraction returned an empty string for form data: ${JSON.stringify(formData)}.`,
        )
      }

      return result
    }

    return schemaValidationFailedFallback ?? schemaValidationFailedParentFallback!
  } else if (extractor.type === 'schemaless') {
    const { extractFn } = extractor
    const result = extractFn(formData as FormDataType)
    if (result == null) {
      throw new Error(
        `Extraction returned an empty string for form data: ${JSON.stringify(formData)}.`,
      )
    }

    return result
  } else {
    throw new Error('Invalid extractor type')
  }
}

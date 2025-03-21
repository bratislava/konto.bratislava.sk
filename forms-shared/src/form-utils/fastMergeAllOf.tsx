import { BAJSONSchema7 } from './ajvKeywords'

const validateObject = (schema: unknown, context: string) => {
  if (typeof schema !== 'object') {
    throw new Error(`${context} must be an object`)
  }
}

const validateSchemaType = (type: unknown, context: string) => {
  if (type && type !== 'object') {
    throw new Error(`${context} type must be either undefined or "object"`)
  }
}

const validateAllowedProperties = (schema: unknown, allowedProps: string[], context: string) => {
  const invalidProps = Object.keys(schema as Record<string, any>).filter(
    (prop) => !allowedProps.includes(prop),
  )
  if (invalidProps.length > 0) {
    throw new Error(`Unsupported properties in ${context}: ${invalidProps.join(', ')}`)
  }
}

/**
 * A very fast implementation of `json-schema-merge-allof` that merges properties from allOf array.
 *
 * The original implementation is incredibly slow and inefficient. The `merger` function is called
 * recursively and always clones the object, even multiple times in the same run. Also, it handles
 * many more use cases than we need. As we use our custom generator for schemas, we can assure that
 * only tiny subset of all features must be supported.
 *
 * This a staple part of an effort to improve performance of the form rendering. Using the original
 * implementation, the form rendering spends more than 50% of the time in this function and the
 * rendering takes lower hundreds of milliseconds. Due to nature of how RJSF works, it is called
 * heavily on each form change (even small changes that don't trigger the schema change = are not
 * a part of a condition).
 *
 * Note: This function is not called on the raw schemas we generate, but on pre-resolved schemas
 * by RJSF, which have a uniform shape. See usage in `retrieveSchemaInternal` implementation in:
 * https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/schema/retrieveSchema.ts
 *
 * The benchmarking on 113 real-world schemas shows:
 * name                           hz      min      max     mean      rme  samples
 * json-schema-merge-allof   23.8816  29.4213  55.9607  41.8732  ±10.76%       13
 * baFastMergeAllOf         5,309.74   0.1024   1.0780   0.1883   ±1.60%     2655   fast
 *
 * baFastMergeAllOf 222.34x faster than json-schema-merge-allof
 *
 * More context:
 * https://github.com/rjsf-team/react-jsonschema-form/pull/4308
 */
export function baFastMergeAllOf(schema: BAJSONSchema7): BAJSONSchema7 {
  validateObject(schema, 'Schema')
  validateSchemaType(schema.type, 'Schema')

  if (!schema.allOf || !Array.isArray(schema.allOf)) {
    return schema
  }

  const newSchema = {
    // The retrieved schemas from RJSF don't have type defined, but the merge implementation adds it, so it is
    // consistent to add it here as well.
    type: 'object',
    ...schema,
    properties: { ...schema.properties },
    required: [...(schema.required || [])],
  }

  delete newSchema.allOf
  ;(schema.allOf as BAJSONSchema7[]).forEach((item) => {
    validateObject(item, 'allOf item')
    validateSchemaType(item.type, 'allOf item')
    validateAllowedProperties(item, ['type', 'properties', 'required'], 'allOf item')

    if (item.properties) {
      newSchema.properties = {
        ...newSchema.properties,
        ...item.properties,
      }
    }
    if (item.required) {
      newSchema.required.push(...item.required)
    }
  })

  if (newSchema.required.length > 0) {
    newSchema.required = [...new Set(newSchema.required)]
  }

  return newSchema as BAJSONSchema7
}

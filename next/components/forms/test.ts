// First function - merging uiSchemas
import { UiSchema } from '@rjsf/utils'
import { JSONSchema7 } from 'json-schema'

const createUiSchemaMerger = () => {
  const empty = {}
  const cache = new WeakMap()

  return (
    schema: JSONSchema7 & { uiSchema: UiSchema },
    uiSchema?: UiSchema,
  ): {
    schema: JSONSchema7
    uiSchema: UiSchema
  } => {
    uiSchema = uiSchema ?? empty

    let innerCache: WeakMap<any, any> = cache.get(schema)

    if (!innerCache) {
      innerCache = new WeakMap()
      cache.set(schema, innerCache)
    }

    let result = innerCache.get(uiSchema)

    if (result) {
      return result
    }

    const newUiSchema = { ...uiSchema, ...schema.uiSchema }
    const newSchema = { ...schema }
    // @ts-ignore
    delete newSchema.uiSchema

    result = { schema: newSchema, uiSchema: newUiSchema } as const

    innerCache.set(uiSchema, result)
    return result
  }
}

export const mergeUiSchema = createUiSchemaMerger()

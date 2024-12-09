import { FieldProps } from '@rjsf/utils'
import { getDefaultRegistry } from '@rjsf/core'
import React, { ComponentType, useMemo } from 'react'
import { BAJSONSchema7 } from './ajvKeywords'
import { defaultUiSchema } from './formDefaults'
import { getObjectFieldInfo } from './getObjectFieldInfo'

const assertBaOrderInProperties = (
  entries: [string, BAJSONSchema7][],
): entries is [string, { baOrder: number }][] => {
  return entries.every(([key, value]) => {
    return typeof key === 'string' && typeof value === 'object' && typeof value.baOrder === 'number'
  })
}

const defaultRegistry = getDefaultRegistry()
const { SchemaField, ObjectField } = defaultRegistry.fields

/**
 * Extracts `baUiSchema` from the schema and uses it as `uiSchema`.
 *
 * The RJSF says that "The `SchemaFieldRender` component is the work-horse of react-jsonschema-form", this is the top-level
 * component that renders each subschema in the form. Therefore, it is possible to extract the UI schema from the schema
 * here and let the original `SchemaField` act as it would be originally there.
 */
const ExtractUiSchemaSchemaField = (props: FieldProps) => {
  const { isFormObject } = getObjectFieldInfo(props.idSchema)
  const baUiSchema = props.schema.baUiSchema
  const uiSchemaEmptyObject = props.uiSchema ? Object.keys(props.uiSchema).length === 0 : false

  // `uiSchema` should be present only in the root object (whether `defaultUiSchema` or empty)
  if (isFormObject && (props.uiSchema === defaultUiSchema || uiSchemaEmptyObject)) {
    return <SchemaField {...props} />
  }

  if (props.uiSchema) {
    throw new Error('uiSchema is not supported')
  }

  return <SchemaField {...props} uiSchema={baUiSchema} />
}

/**
 * Dynamically creates `ui:order` based on `baOrder` values in schema.
 *
 * The input schema of this function is resolved object schema with merged all of subschemas (see fastMergeAllOf).
 */
const OrderObjectField = (props: FieldProps) => {
  if (props.uiSchema?.['ui:order']) {
    throw new Error('ui:order should not be present in the original uiSchema')
  }

  const newUiSchema = useMemo(() => {
    const entries = Object.entries(props.schema.properties as Record<string, BAJSONSchema7>)
    if (!assertBaOrderInProperties(entries)) {
      throw new Error('baOrder should be present in all properties')
    }

    const entriesSorted = entries.toSorted(
      ([, child1], [, child2]) => child1.baOrder - child2.baOrder,
    )
    const uiOrder = entriesSorted.map(([key]) => key)

    return {
      ...props.uiSchema,
      'ui:order': uiOrder,
    }
  }, [props.uiSchema, props.schema.properties])

  return <ObjectField {...props} uiSchema={newUiSchema} />
}

export type DefaultFormFieldType = 'SchemaField' | 'ObjectField'

export const defaultFormFields = {
  SchemaField: ExtractUiSchemaSchemaField,
  ObjectField: OrderObjectField,
} satisfies Record<DefaultFormFieldType, ComponentType<FieldProps>>

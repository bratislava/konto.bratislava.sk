import { ObjectFieldUiOptions } from './uiOptionsTypes'
import {
  GeneratorConditionalFields,
  GeneratorField,
  GeneratorFieldType,
  GeneratorObjectField,
} from './generatorTypes'
import { addBaOrderToFields } from './addBaOrderToFields'
import { removeUndefinedValues } from './helpers'

/**
 * Object is the most complex field type to handle. For example, step is an instance of object. In JSONSchema, ordinary
 * fields are located in the `properties` key, while conditional fields are located in the `allOf` key. However, to
 * simplify the usage of the generator we provide a single interface for both ordinary and conditional fields. This
 * function splits them to their respective locations.
 */
export const object = (
  property: string | null,
  uiOptions: ObjectFieldUiOptions,
  fields: (GeneratorFieldType | null)[],
): GeneratorObjectField => {
  const filteredFields = fields.filter((field) => field !== null) as GeneratorFieldType[]
  const fieldsWithOrder = addBaOrderToFields(filteredFields)
  const ordinaryFields = fieldsWithOrder.filter(
    (field) => !('condition' in field),
  ) as GeneratorField[]
  const conditionalFields = fieldsWithOrder.filter(
    (field) => 'condition' in field,
  ) as GeneratorConditionalFields[]

  const isUiOptionsEmpty = Object.keys(uiOptions).length === 0
  const allOf = conditionalFields.map((field) => ({
    if: field.condition,
    then: field.thenSchema,
    else: field.elseSchema,
  }))

  const requiredOrdinaryFields = ordinaryFields.filter((field) => field.required)
  const requiredConditionalFields = conditionalFields.filter(
    (field) => field.thenSchema.required || field.elseSchema?.required,
  )
  const requiredFieldsProperties = requiredOrdinaryFields.map((field) => field.property)
  const selfRequired = requiredOrdinaryFields.length > 0 || requiredConditionalFields.length > 0

  return {
    property,
    schema: removeUndefinedValues({
      type: 'object' as const,
      properties: Object.fromEntries(ordinaryFields.map((field) => [field.property, field.schema])),
      required: requiredFieldsProperties,
      allOf: allOf.length > 0 ? allOf : undefined,
      baUiSchema: isUiOptionsEmpty
        ? undefined
        : {
            'ui:options': uiOptions,
          },
    }),
    required: selfRequired,
  }
}
/**
 * Arrays and conditional fields needs to use created schema for object internally, but the object must have no property,
 * and uiOptions.
 */
export const simpleObjectInternal = (fields: (GeneratorFieldType | null)[]) => {
  const result = object(null, {}, fields)
  if (result.schema.baUiSchema) {
    throw new Error('Simple object should not have uiOptions.')
  }

  return result
}

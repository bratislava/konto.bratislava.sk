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
  options: { required?: boolean },
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

  const getSchema = () => {
    const isUiOptionsEmpty = Object.keys(uiOptions).length === 0
    const allOf = conditionalFields.map((field) => ({
      if: field.condition,
      then: field.thenSchema,
      else: field.elseSchema,
    }))

    return removeUndefinedValues({
      type: 'object' as const,
      properties: Object.fromEntries(ordinaryFields.map((field) => [field.property, field.schema])),
      required: ordinaryFields.filter((field) => field.required).map((field) => field.property),
      allOf: allOf.length > 0 ? allOf : undefined,
      baUiSchema: isUiOptionsEmpty
        ? undefined
        : {
            'ui:options': uiOptions,
          },
    })
  }

  return {
    property,
    schema: getSchema(),
    required: Boolean(options.required),
  }
}
/**
 * Arrays and conditional fields needs to use created schema for object internally, but the object must have no property,
 * and uiOptions.
 */
export const simpleObjectInternal = (fields: (GeneratorFieldType | null)[]) => {
  const result = object(null, {}, {}, fields)
  if (result.schema.baUiSchema) {
    throw new Error('Simple object should not have uiOptions.')
  }

  return result
}

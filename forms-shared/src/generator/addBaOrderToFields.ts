import { BAJSONSchema7 } from '../form-utils/ajvKeywords'
import { GeneratorFieldType } from './functions'
import { create } from 'mutative'

/**
 * Recursively increments baOrder values for all fields in a schema and its nested conditional fields.
 * Returns the maximum baOrder value assigned to continue counting from that number.
 *
 * Example with nested conditionals:
 * [
 *   input('name'),
 *   conditionalFields(condition1, [
 *     input('companyName'),
 *     input('taxId'),
 *     conditionalFields(condition2,
 *       [input('extraField')],
 *       [input('extraFieldElse')]
 *     )
 *   ]),
 *   input('email'),
 *   input('phone')
 * ]
 *
 * First pass assigns:
 * name: 1
 * companyName: 2
 * taxId: 3
 * extraField: 4 (if condition2)
 * extraFieldElse: 5 (if not condition2)
 * email: 6
 * phone: 7
 *
 * When this structure is wrapped in another object, all numbers must be incremented
 * by the current maximum to preserve unique ordering:
 * outerField1: 1
 * outerField2: 2
 * nestedObject:
 *   name: 3          (1 + 2)
 *   companyName: 4   (2 + 2)
 *   taxId: 5         (3 + 2)
 *   extraField: 6    (4 + 2)
 *   extraFieldElse: 7 (5 + 2)
 *   email: 8         (6 + 2)
 *   phone: 9         (7 + 2)
 * outerField3: 10
 *
 * Warning: Mutates the schema, don't use outside addBaOrderToFields!
 */
const incrementAllChildOrders = (schema: BAJSONSchema7, incrementBy: number) => {
  let max = incrementBy

  Object.values((schema.properties as BAJSONSchema7) ?? {}).forEach((property: BAJSONSchema7) => {
    if (!property.baOrder) {
      throw new Error('baOrder is required')
    }
    property.baOrder = property.baOrder + incrementBy
    max = Math.max(max, property.baOrder)
  })
  ;(schema.allOf as BAJSONSchema7[])?.forEach((allOfSchema) => {
    if (allOfSchema.then) {
      max = Math.max(max, incrementAllChildOrders(allOfSchema.then as BAJSONSchema7, incrementBy))
    }
    if (allOfSchema.else) {
      max = Math.max(max, incrementAllChildOrders(allOfSchema.else as BAJSONSchema7, incrementBy))
    }
  })

  return max
}

/**
 * Assigns sequential baOrder values to fields in a form schema.
 * This is a crucial improvement over the previous implementation that used ui:order.
 *
 * The previous approach maintained field order through ui:order array:
 * {
 *   'ui:order': ['name', 'email', 'phone']
 * }
 * But this had limitations - fields in then/else branches needed different names to appear in different orders:
 * then: ['name', 'email']
 * else: ['emailElse', 'nameElse'] // Different names required for different order
 *
 * The current baOrder approach:
 * 1. Assigns sequential numbers to regular fields using a counter
 * 2. For conditional fields, calls incrementAllChildOrders because:
 *    - Their schemas already contain baOrder values from previous processing
 *    - These values need to be incremented by the current counter to maintain sequence
 *    - The counter needs to be updated to the maximum value assigned to continue the sequence
 *
 * Example flow:
 * [
 *   input1,                    // gets baOrder: 1
 *   conditionalFields([        // nested fields already processed (not FieldType, but have JSONSchemas), have baOrders 1,2
 *     input2,                  // needs to become 2 (1 + current counter 1)
 *     input3                   // needs to become 3 (2 + current counter 1)
 *   ]),
 *   input4                     // gets next value after max from conditional (4)
 * ]
 *
 * The counter is always set to the maximum value returned by incrementAllChildOrders
 * to ensure the sequence continues correctly after processing nested structures.
 *
 * `mutative` is used to produce immutable results, it would be very difficult to write the function in a functional style.
 */
export const addBaOrderToFields = (fields: GeneratorFieldType[]) => {
  let counter = 0
  return create(fields, (draft) => {
    draft.forEach((field) => {
      if ('condition' in field) {
        if (field.thenSchema) {
          counter = incrementAllChildOrders(field.thenSchema, counter)
        }
        if (field.elseSchema) {
          counter = incrementAllChildOrders(field.elseSchema, counter)
        }
      } else {
        field.schema.baOrder = ++counter
      }
    })
  })
}

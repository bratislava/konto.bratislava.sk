import { addBaOrderToFields } from '../../src/generator/addBaOrderToFields'
import {
  conditionalFields,
  GeneratorConditionalFields,
  GeneratorField,
  input,
} from '../../src/generator/functions'
import { createCondition } from '../../src/generator/helpers'

describe('addBaOrderToFields', () => {
  it('assigns sequential order to regular fields', () => {
    const fields = [
      input('field1', { title: 'Field 1', type: 'text' }, {}),
      input('field2', { title: 'Field 2', type: 'text' }, {}),
      input('field3', { title: 'Field 3', type: 'text' }, {}),
    ]

    const result = addBaOrderToFields(fields)

    expect((result[0] as GeneratorField).schema.baOrder).toBe(1)
    expect((result[1] as GeneratorField).schema.baOrder).toBe(2)
    expect((result[2] as GeneratorField).schema.baOrder).toBe(3)
  })

  it('handles conditional fields with then/else branches', () => {
    const fields = [
      input('field1', { title: 'Field 1', type: 'text' }, {}),
      conditionalFields(
        createCondition([[['field1'], { const: 'show' }]]),
        [input('field2', { title: 'Field 2', type: 'text' }, {})],
        [input('field3', { title: 'Field 3', type: 'text' }, {})],
      ),
      input('field4', { title: 'Field 4', type: 'text' }, {}),
    ]

    const result = addBaOrderToFields(fields)

    // Regular fields get sequential numbers
    expect((result[0] as GeneratorField).schema.baOrder).toBe(1)
    expect((result[2] as GeneratorField).schema.baOrder).toBe(4)

    // Check then/else schemas have correct ordering
    const conditional = result[1] as GeneratorConditionalFields
    // @ts-expect-error Improve BAJONSchema7 type
    expect(conditional.thenSchema.properties.field2.baOrder).toBe(2)
    // @ts-expect-error Improve BAJONSchema7 type
    expect(conditional.elseSchema.properties.field3.baOrder).toBe(3)
  })

  it('handles nested conditional fields with else branches', () => {
    const fields = [
      input('field1', { title: 'Field 1', type: 'text' }, {}),
      conditionalFields(
        createCondition([[['field1'], { const: 'show' }]]),
        [
          input('field2', { title: 'Field 2', type: 'text' }, {}),
          conditionalFields(
            createCondition([[['field2'], { const: 'show' }]]),
            [input('field3', { title: 'Field 3', type: 'text' }, {})],
            [input('field4', { title: 'Field 4', type: 'text' }, {})],
          ),
        ],
        [input('field5', { title: 'Field 5', type: 'text' }, {})],
      ),
      input('field6', { title: 'Field 6', type: 'text' }, {}),
    ]

    const result = addBaOrderToFields(fields)

    expect((result[0] as GeneratorField).schema.baOrder).toBe(1)

    const outerConditional = result[1] as GeneratorConditionalFields
    // @ts-expect-error Improve BAJONSchema7 type
    expect(outerConditional.thenSchema.properties.field2.baOrder).toBe(2)

    // @ts-expect-error Improve BAJONSchema7 type
    const innerConditional = outerConditional.thenSchema.allOf[0]
    // @ts-expect-error Improve BAJONSchema7 type
    expect(innerConditional.then.properties.field3.baOrder).toBe(3)
    // @ts-expect-error Improve BAJONSchema7 type
    expect(innerConditional.else.properties.field4.baOrder).toBe(4)

    // @ts-expect-error Improve BAJONSchema7 type
    expect(outerConditional.elseSchema.properties.field5.baOrder).toBe(5)
    expect((result[2] as GeneratorField).schema.baOrder).toBe(6)
  })
})

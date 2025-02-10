import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, NumberUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const number = (
  property: string,
  options: GeneratorBaseOptions &
    (
      | {
          type: 'number'
          step: number
        }
      | { type: 'integer'; step?: number }
    ) & {
      default?: number
      minimum?: number
      maximum?: number
    },
  uiOptions: NumberUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type,
      title: options.title,
      default: options.default,
      minimum: options.minimum,
      maximum: options.maximum,
      multipleOf: options.step,
      baUiSchema: {
        'ui:widget': BaWidgetType.Number,
        'ui:label': false,
        'ui:options': { ...uiOptions },
      },
    }),
    required: Boolean(options.required),
  }
}

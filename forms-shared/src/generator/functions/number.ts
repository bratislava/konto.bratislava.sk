import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, NumberUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const number = (
  property: string,
  options: GeneratorBaseOptions & {
    type?: 'number' | 'integer'
    default?: number
    minimum?: number
    exclusiveMinimum?: number
    maximum?: number
    exclusiveMaximum?: number
  },
  uiOptions: NumberUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type ?? 'number',
      title: options.title,
      default: options.default,
      minimum: options.minimum,
      exclusiveMinimum: options.exclusiveMinimum,
      maximum: options.maximum,
      exclusiveMaximum: options.exclusiveMaximum,
      baUiSchema: {
        'ui:widget': BaWidgetType.Number,
        'ui:label': false,
        'ui:options': { ...uiOptions },
      },
    }),
    required: Boolean(options.required),
  }
}

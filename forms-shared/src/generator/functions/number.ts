import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, NumberUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

/**
 * Creates a number field generator
 * @param property - The property name
 * @param options - Configuration options:
 *   - type: 'number' for decimal/float numbers (requires step)
 *   - type: 'integer' for whole numbers (step defaults to 1)
 *   - step: Required (we don't want to have infinite decimal places) for 'number' type to control decimal precision
 *   - default: Default value
 *   - minimum: Minimum allowed value
 *   - maximum: Maximum allowed value
 */
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
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.Number,
        'ui:options': { ...uiOptions },
      },
    }),
    required: Boolean(options.required),
  }
}

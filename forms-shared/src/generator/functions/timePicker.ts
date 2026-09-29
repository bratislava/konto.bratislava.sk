import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'
import { BaWidgetType, TimePickerUiOptions } from '../uiOptionsTypes'

export const timePicker = (
  property: string,
  options: GeneratorBaseOptions & { default?: string },
  uiOptions: TimePickerUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      format: 'ba-time',
      title: options.title,
      default: options.default,
      baUiSchema: {
        'ui:widget': BaWidgetType.TimePicker,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, DatePickerUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const datePicker = (
  property: string,
  options: GeneratorBaseOptions & { default?: string },
  uiOptions: DatePickerUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      format: 'date',
      title: options.title,
      default: options.default,
      baUiSchema: {
        'ui:widget': BaWidgetType.DatePicker,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

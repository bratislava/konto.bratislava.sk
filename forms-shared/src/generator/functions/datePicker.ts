import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'
import { BaWidgetType, DatePickerUiOptions } from '../uiOptionsTypes'

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

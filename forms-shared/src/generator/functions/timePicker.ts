import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, TimePickerUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

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
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.TimePicker,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

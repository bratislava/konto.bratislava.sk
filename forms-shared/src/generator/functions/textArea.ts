import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, TextAreaUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

export const textArea = (
  property: string,
  options: GeneratorBaseOptions,
  uiOptions: TextAreaUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      baUiSchema: {
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.TextArea,
        'ui:options': uiOptions,
      },
    }),

    required: Boolean(options.required),
  }
}

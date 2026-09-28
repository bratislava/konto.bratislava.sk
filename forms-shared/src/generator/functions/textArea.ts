import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'
import { BaWidgetType, TextAreaUiOptions } from '../uiOptionsTypes'

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
        'ui:widget': BaWidgetType.TextArea,
        'ui:options': uiOptions,
      },
    }),

    required: Boolean(options.required),
  }
}

import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, TextAreaUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

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
        'ui:label': false,
        'ui:options': uiOptions,
      },
    }),

    required: Boolean(options.required),
  }
}

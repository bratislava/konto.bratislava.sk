import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'
import { BaWidgetType, CheckboxUiOptions } from '../uiOptionsTypes'

export const checkbox = (
  property: string,
  options: GeneratorBaseOptions & { default?: boolean; constValue?: boolean },
  uiOptions: CheckboxUiOptions,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'boolean',
      title: options.title,
      default: options.default,
      const: typeof options.constValue === 'boolean' ? options.constValue : undefined,
      baUiSchema: {
        'ui:widget': BaWidgetType.Checkbox,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, CheckboxUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

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
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.Checkbox,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

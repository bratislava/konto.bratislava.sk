import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import {
  createEnumMetadata,
  createEnumSchemaDefaultMultiple,
  createEnumSchemaEnum,
  OptionItem,
} from '../optionItems'
import { BaWidgetType, CheckboxGroupUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const checkboxGroup = (
  property: string,
  options: GeneratorBaseOptions & {
    minItems?: number
    maxItems?: number
    items: OptionItem<string>[]
  },
  uiOptions: Omit<CheckboxGroupUiOptions, 'enumMetadata'>,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'array',
      title: options.title,
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      uniqueItems: true,
      items: {
        enum: createEnumSchemaEnum(options.items),
      },
      default: createEnumSchemaDefaultMultiple(options.items),
      baUiSchema: {
        'ui:widget': BaWidgetType.CheckboxGroup,
        'ui:options': {
          ...uiOptions,
          enumMetadata: createEnumMetadata(options.items),
        },
      },
    }),
    required: Boolean(options.required),
  }
}

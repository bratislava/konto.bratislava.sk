import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import {
  createEnumMetadata,
  createEnumSchemaDefaultMultiple,
  createEnumSchemaEnum,
  OptionItem,
} from '../optionItems'
import { BaWidgetType, SelectUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

export const selectMultiple = (
  property: string,
  options: GeneratorBaseOptions & {
    minItems?: number
    maxItems?: number
    items: OptionItem<string>[]
  },
  uiOptions: Omit<SelectUiOptions, 'enumMetadata'>,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'array',
      title: options.title,
      items: {
        type: 'string',
        enum: createEnumSchemaEnum(options.items),
      },
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      uniqueItems: true,
      default: createEnumSchemaDefaultMultiple(options.items),
      baUiSchema: {
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.SelectMultiple,
        'ui:options': {
          ...uiOptions,
          enumMetadata: createEnumMetadata(options.items),
        },
      },
    }),
    required: Boolean(options.required),
  }
}

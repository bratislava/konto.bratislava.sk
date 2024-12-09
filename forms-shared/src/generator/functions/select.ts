import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import {
  createEnumMetadata,
  createEnumSchemaDefault,
  createEnumSchemaEnum,
  OptionItem,
} from '../optionItems'
import { BaWidgetType, SelectUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const select = (
  property: string,
  options: GeneratorBaseOptions & {
    items: OptionItem<string>[]
  },
  uiOptions: Omit<SelectUiOptions, 'enumMetadata'>,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      enum: createEnumSchemaEnum(options.items),
      default: createEnumSchemaDefault(options.items),
      baUiSchema: {
        'ui:widget': BaWidgetType.Select,
        'ui:options': {
          ...uiOptions,
          enumMetadata: createEnumMetadata(options.items),
        },
      },
    }),
    required: Boolean(options.required),
  }
}

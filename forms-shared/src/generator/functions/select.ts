import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import {
  createEnumMetadata,
  createEnumSchemaDefault,
  createEnumSchemaEnum,
  OptionItem,
} from '../optionItems'
import { BaWidgetType, SelectUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

export const select = (
  property: string,
  options: GeneratorBaseOptions & {
    items: OptionItem<string>[]
    // TODO: Add to all fields
    // @default false
    disabled?: boolean
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
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.Select,
        'ui:options': {
          ...uiOptions,
          enumMetadata: createEnumMetadata(options.items),
        },
        'ui:disabled': options.disabled,
      },
    }),
    required: Boolean(options.required),
  }
}

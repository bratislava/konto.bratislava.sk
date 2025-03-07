import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import {
  createEnumMetadata,
  createEnumSchemaDefault,
  createEnumSchemaEnum,
  OptionItem,
} from '../optionItems'
import { BaWidgetType, RadioGroupUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

type StringToType<T> = T extends 'string' ? string : T extends 'boolean' ? boolean : never

export const radioGroup = <ValueType extends 'string' | 'boolean'>(
  property: string,
  options: GeneratorBaseOptions & {
    type: ValueType
    items: OptionItem<StringToType<ValueType>>[]
  },
  uiOptions: Omit<RadioGroupUiOptions, 'enumMetadata'>,
): GeneratorField => {
  return {
    property,
    schema: removeUndefinedValues({
      type: options.type,
      title: options.title,
      enum: createEnumSchemaEnum(options.items),
      default: createEnumSchemaDefault(options.items),
      baUiSchema: {
        ...defaultFieldUiSchema,
        'ui:widget': BaWidgetType.RadioGroup,
        'ui:options': {
          ...uiOptions,
          enumMetadata: createEnumMetadata(options.items),
        },
      },
    }),
    required: Boolean(options.required),
  }
}

import { GeneratorBaseOptions, GeneratorField, GeneratorFieldType } from '../generatorTypes'
import { ArrayFieldUiOptions } from '../uiOptionsTypes'
import { simpleObjectInternal } from '../object'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

export const arrayField = (
  property: string,
  options: GeneratorBaseOptions & { minItems?: number; maxItems?: number },
  uiOptions: ArrayFieldUiOptions,
  fields: (GeneratorFieldType | null)[],
): GeneratorField => {
  const { schema: objectSchema } = simpleObjectInternal(fields)

  return {
    property,
    schema: removeUndefinedValues({
      title: options.title,
      type: 'array',
      items: objectSchema,
      minItems: options.minItems ?? (options.required ? 1 : undefined),
      maxItems: options.maxItems,
      baUiSchema: {
        ...defaultFieldUiSchema,
        'ui:options': uiOptions,
      },
    }),
    required: Boolean(options.required),
  }
}

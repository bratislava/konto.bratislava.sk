import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

type FileUploadMultipleOptions = GeneratorBaseOptions & {
  minItems?: number
  maxItems?: number
}

export const fileUploadMultiple = (
  property: string,
  options: FileUploadMultipleOptions,
  uiOptions: FileUploadUiOptions,
): GeneratorField => ({
  property,
  schema: removeUndefinedValues({
    title: options.title,
    type: 'array',
    items: {
      type: 'string',
      format: 'ba-file-uuid',
      baFile: true,
    },
    minItems: options.minItems ?? (options.required ? 1 : undefined),
    maxItems: options.maxItems,
    default: [],
    baUiSchema: {
      'ui:widget': BaWidgetType.FileUploadMultiple,
      'ui:options': uiOptions,
    },
  }),
  required: Boolean(options.required),
})

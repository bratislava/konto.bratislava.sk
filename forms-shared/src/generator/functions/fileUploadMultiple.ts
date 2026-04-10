import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

type FileUploadMultipleOptions<K extends Record<string, string>> = GeneratorBaseOptions & {
  id: K[keyof K]
}

export const fileUploadMultiple = <K extends Record<string, string>>(
  property: string,
  options: FileUploadMultipleOptions<K>,
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
    minItems: options.required ? 1 : undefined,
    default: [],
    baUiSchema: {
      'ui:widget': BaWidgetType.FileUploadMultiple,
      'ui:options': uiOptions,
      'ui:fileId': options.id,
    },
  }),
  required: Boolean(options.required),
})

import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

type FileUploadOptions<K extends Record<string, string>> = GeneratorBaseOptions & {
  id: K[keyof K]
}

export const fileUpload = <K extends Record<string, string>>(
  property: string,
  options: FileUploadOptions<K>,
  uiOptions: FileUploadUiOptions,
): GeneratorField => ({
  property,
  schema: removeUndefinedValues({
    title: options.title,
    type: 'string',
    format: 'ba-file-uuid',
    baFile: true,
    baUiSchema: {
      'ui:widget': BaWidgetType.FileUpload,
      'ui:options': uiOptions,
      'ui:fileId': options.id,
    },
  }),
  required: Boolean(options.required),
})

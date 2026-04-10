import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { FileLimits } from '../../definitions/formDefinitionTypes'

type FileUploadOptions<K extends FileLimits> = GeneratorBaseOptions & {
  id?: keyof K & string
}

export const fileUpload = <K extends FileLimits>(
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

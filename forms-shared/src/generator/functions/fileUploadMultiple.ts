import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { FormDefinitionFiles } from '../../definitions/formDefinitionTypes'

type FileUploadMultipleProperty<K extends FormDefinitionFiles<string>> =
  string extends K[number]['id'] ? never : K[number]['id']

type FileUploadMultipleOptions<K extends FormDefinitionFiles<string>> = GeneratorBaseOptions & {
  id: FileUploadMultipleProperty<K>
}

export const fileUploadMultiple = <
  K extends FormDefinitionFiles<string> = FormDefinitionFiles<string>,
>(
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

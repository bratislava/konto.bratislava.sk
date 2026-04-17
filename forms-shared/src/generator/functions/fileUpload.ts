import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { FormFiles } from '../../definitions/formDefinitionTypes'

type FileUploadOptions<K extends FormFiles<string>> = GeneratorBaseOptions & {
  slotId: K['slots'][number]['slotId']
}

export const fileUpload = <K extends FormFiles<string> = never>(
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
      'ui:slot': options.slotId,
    },
  }),
  required: Boolean(options.required),
})

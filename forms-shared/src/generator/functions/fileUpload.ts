import { FormFiles } from '../../definitions/formDefinitionTypes'
import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { removeUndefinedValues } from '../helpers'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'

type FileUploadOptions<K extends FormFiles<string>> = GeneratorBaseOptions & {
  slotId: K['slots'][number]['slotId']
}

export const fileUpload = <K extends FormFiles<string> = never>(
  property: string,
  options: FileUploadOptions<K>,
  uiOptions: Omit<FileUploadUiOptions, 'slotId'>,
): GeneratorField => ({
  property,
  schema: removeUndefinedValues({
    title: options.title,
    type: 'string',
    format: 'ba-file-uuid',
    baFile: true,
    baUiSchema: {
      'ui:widget': BaWidgetType.FileUpload,
      'ui:options': { ...uiOptions, slotId: options.slotId },
    },
  }),
  required: Boolean(options.required),
})

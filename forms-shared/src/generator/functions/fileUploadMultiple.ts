import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { FormFiles } from '../../definitions/formDefinitionTypes'

type FileUploadMultipleOptions<K extends FormFiles<string>> = GeneratorBaseOptions & {
  slotId: K['slots'][number]['slotId']
}

export const fileUploadMultiple = <K extends FormFiles<string> = never>(
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
      'ui:slot': options.slotId,
    },
  }),
  required: Boolean(options.required),
})

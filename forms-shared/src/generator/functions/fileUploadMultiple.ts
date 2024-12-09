import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const fileUploadMultiple = (
  property: string,
  options: GeneratorBaseOptions,
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
    },
  }),
  required: Boolean(options.required),
})

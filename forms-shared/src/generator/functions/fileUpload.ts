import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'
import { defaultFieldUiSchema } from '../../form-utils/formDefaults'

export const fileUpload = (
  property: string,
  options: GeneratorBaseOptions,
  uiOptions: FileUploadUiOptions,
): GeneratorField => ({
  property,
  schema: removeUndefinedValues({
    title: options.title,
    type: 'string',
    format: 'ba-file-uuid',
    baFile: true,
    baUiSchema: {
      ...defaultFieldUiSchema,
      'ui:widget': BaWidgetType.FileUpload,
      'ui:options': uiOptions,
    },
  }),
  required: Boolean(options.required),
})

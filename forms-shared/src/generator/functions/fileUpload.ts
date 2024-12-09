import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaWidgetType, FileUploadUiOptions } from '../uiOptionsTypes'
import { removeUndefinedValues } from '../helpers'

export const fileUpload = (
  property: string,
  options: GeneratorBaseOptions & { multiple?: boolean },
  uiOptions: FileUploadUiOptions,
): GeneratorField => {
  const baUiSchema = {
    'ui:widget': options.multiple ? BaWidgetType.FileUploadMultiple : BaWidgetType.FileUpload,
    'ui:options': uiOptions,
  }

  return {
    property,
    schema: removeUndefinedValues(
      options.multiple
        ? {
            title: options.title,
            type: 'array',
            items: {
              type: 'string',
              format: 'ba-file-uuid',
              file: true,
            },
            minItems: options.required ? 1 : undefined,
            default: [],
            baUiSchema,
          }
        : {
            title: options.title,
            type: 'string',
            format: 'ba-file-uuid',
            file: true,
            baUiSchema,
          },
    ),
    required: Boolean(options.required),
  }
}

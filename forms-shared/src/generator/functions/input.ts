import { GeneratorBaseOptions, GeneratorField } from '../generatorTypes'
import { BaAjvInputFormat } from '../../form-utils/ajvFormats'
import { BaWidgetType, InputUiOptions, inputSizeMax, inputSizeMin } from '../uiOptionsTypes'
import { getInputTypeForAjvFormat, removeUndefinedValues } from '../helpers'

export const input = (
  property: string,
  options: GeneratorBaseOptions & {
    type: 'text' | 'password' | 'email' | BaAjvInputFormat
    default?: string
  },
  uiOptions: Omit<InputUiOptions, 'inputType'>,
): GeneratorField => {
  const { inputSize } = uiOptions
  if (
    inputSize !== undefined &&
    (!Number.isInteger(inputSize) || inputSize < inputSizeMin || inputSize > inputSizeMax)
  ) {
    throw new Error(
      `inputSize must be an integer between ${inputSizeMin} and ${inputSizeMax}, got ${inputSize} (property "${property}")`,
    )
  }

  const { inputType, format } = (() => {
    if (options.type === 'email') {
      return {
        inputType: 'email',
        format: 'email',
      }
    }

    if (options.type === 'text' || options.type === 'password') {
      return {
        inputType: options.type,
        format: undefined,
      }
    }

    return {
      inputType: getInputTypeForAjvFormat(options.type),
      format: options.type,
    }
  })()

  return {
    property,
    schema: removeUndefinedValues({
      type: 'string',
      title: options.title,
      format,
      default: options.default,
      baUiSchema: {
        'ui:widget': BaWidgetType.Input,
        'ui:options': { ...uiOptions, inputType },
      },
    }),
    required: Boolean(options.required),
  }
}

import { GeneratorFieldType } from '../generatorTypes'
import { object } from '../object'
import kebabCase from 'lodash/kebabCase'
import { removeUndefinedValues } from '../helpers'
import { StepUiOptions } from '../uiOptionsTypes'

export const step = (
  property: string,
  options: {
    title: string
    description?: string
    stepperTitle?: string
    customHash?: string
  },
  fields: (GeneratorFieldType | null)[],
) => {
  const { schema } = object(property, { required: true }, {}, fields)
  const getHash = () => {
    if (options.customHash) {
      return options.customHash
    }
    if (options.stepperTitle) {
      return kebabCase(options.stepperTitle)
    }
    return kebabCase(options.title)
  }

  return {
    property,
    schema: removeUndefinedValues({
      type: 'object',
      properties: {
        [property]: {
          title: options.title,
          description: options.description,
          ...schema,
          baUiSchema: {
            'ui:options': {
              stepperTitle: options.stepperTitle,
              stepQueryParam: getHash(),
            } satisfies StepUiOptions,
          },
          baOrder: 1,
        },
      },
      required: [property],
    }),
  }
}

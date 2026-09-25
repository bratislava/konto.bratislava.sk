import type { RJSFSchema } from '@rjsf/utils'
import { GeneratorFieldType } from '../generatorTypes'
import { step } from './step'
import { removeUndefinedValues } from '../helpers'
import { StepUiOptions } from '../uiOptionsTypes'

export const conditionalStep = (
  property: string,
  condition: RJSFSchema,
  options: {
    title: string
  } & StepUiOptions,
  fields: (GeneratorFieldType | null)[],
) => {
  const { schema } = step(property, options, fields)
  return {
    property,
    schema: removeUndefinedValues({ if: condition, then: schema }),
    required: true,
  }
}

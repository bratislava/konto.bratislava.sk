import type { RJSFSchema } from '@rjsf/utils'
import { GeneratorFieldType } from '../generatorTypes'
import { step } from './step'
import { removeUndefinedValues } from '../helpers'

export const conditionalStep = (
  property: string,
  condition: RJSFSchema,
  options: {
    title: string
    customHash?: string
  },
  fields: (GeneratorFieldType | null)[],
) => {
  const { schema } = step(property, options, fields)
  return {
    property,
    schema: removeUndefinedValues({ if: condition, then: schema }),
    required: true,
  }
}

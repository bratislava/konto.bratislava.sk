import type { RJSFSchema } from '@rjsf/utils'
import { GeneratorConditionalFields, GeneratorFieldType } from '../generatorTypes'
import { simpleObjectInternal } from '../object'

export const conditionalFields = (
  condition: RJSFSchema,
  thenFields: (GeneratorFieldType | null)[],
  elseFields: (GeneratorFieldType | null)[] = [],
): GeneratorConditionalFields => {
  const filteredThenFields = thenFields.filter((field) => field !== null) as GeneratorFieldType[]
  const filteredElseFields = elseFields.filter((field) => field !== null) as GeneratorFieldType[]

  const { schema: thenSchema } = simpleObjectInternal(filteredThenFields)
  const { schema: elseSchema } = simpleObjectInternal(filteredElseFields)

  return {
    condition,
    thenSchema,
    elseSchema: filteredElseFields.length > 0 ? elseSchema : undefined,
  }
}

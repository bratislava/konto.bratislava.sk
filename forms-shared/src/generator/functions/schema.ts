import { step } from './step'
import { conditionalStep } from './conditionalStep'
import { removeUndefinedValues } from '../helpers'
import type { RJSFSchema } from '@rjsf/utils'

export const schema = (
  options: {
    title: string
    description?: string
  },
  steps: (ReturnType<typeof step | typeof conditionalStep> | null)[],
) => {
  const filteredSteps = steps.filter((stepInner) => stepInner != null) as ReturnType<
    typeof step | typeof conditionalStep
  >[]

  return removeUndefinedValues({
    ...options,
    allOf: filteredSteps.map((stepInner) => stepInner.schema),
  }) as RJSFSchema
}

import type { RJSFSchema } from '@rjsf/utils'

import { removeUndefinedValues } from '../helpers'
import { conditionalStep } from './conditionalStep'
import { step } from './step'

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

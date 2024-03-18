/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
import { GenericObjectType } from '@rjsf/utils'
import { clone } from 'lodash'
import { getTaxCalculatorExpression } from '../../calculators'

export const evaluateFormula = (formula: string, data: GenericObjectType) => {
  try {
    const expression = getTaxCalculatorExpression(formula)
    // It is not in the documentation, but `expr-eval` mutates the original data!
    const clonedData = clone(data)
    const evaluated = expression?.evaluate(clonedData) as unknown

    if (!Number.isFinite(evaluated)) {
      return null
    }

    return evaluated as number
  } catch (error) {
    return null
  }
}

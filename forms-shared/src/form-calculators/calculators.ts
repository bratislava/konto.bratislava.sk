import { GenericObjectType } from '@rjsf/utils'
import { Expression, Parser } from 'expr-eval'
import { clone } from 'lodash'

import { parseRatio } from '../form-utils/ajvFormats'
import { SharedLogger } from '../utils/sharedLogger'

export function getFormCalculatorExpression(
  formula: string,
  logError = false,
  logger: SharedLogger,
) {
  const parser = new Parser()

  // Ratio (e.g. "5/13") is a string that needs to be evaluated.
  parser.functions.evalRatio = (arg: string) => {
    if (parseRatio(arg).isValid) {
      return parser.evaluate(arg)
    }
    return NaN
  }
  parser.functions.ratioNumerator = (arg: string) => {
    const parsed = parseRatio(arg)
    if (parsed.isValid) {
      return parsed.numerator
    }
    return NaN
  }
  parser.functions.ratioDenominator = (arg: string) => {
    const parsed = parseRatio(arg)
    if (parsed.isValid) {
      return parsed.denominator
    }
    return NaN
  }

  try {
    return parser.parse(formula)
  } catch (error) {
    if (logError) {
      logger.log('Error in getFormCalculatorExpression', error)
    }
    return null
  }
}

export function calculateFormCalculatorExpression(
  expression: Expression | null,
  data: GenericObjectType,
  logError = false,
  logger: SharedLogger,
) {
  try {
    // It is not in the documentation, but `expr-eval` mutates the original data!
    const clonedData = clone(data)
    const evaluated = expression?.evaluate(clonedData) as unknown

    if (!Number.isFinite(evaluated)) {
      return null
    }

    return evaluated as number
  } catch (error) {
    if (logError) {
      logger.log('Error in calculateFormCalculatorExpression', error)
    }
    return null
  }
}

export function calculateFormCalculatorFormula(
  formula: string,
  data: GenericObjectType,
  logError = false,
) {
  const logger = new SharedLogger('calculators.ts')
  const expression = getFormCalculatorExpression(formula, logError, logger)
  return calculateFormCalculatorExpression(expression, data, logError, logger)
}

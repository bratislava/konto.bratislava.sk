/* eslint-disable @typescript-eslint/explicit-function-return-type,eslint-comments/disable-enable-pair */
import { GenericObjectType } from '@rjsf/utils'
import { Parser } from 'expr-eval'
import { clone } from 'lodash'

export const parseRatio = (value: string) => {
  const ratioRegex = /^(0|[1-9]\d*)\/([1-9]\d*)$/
  if (!ratioRegex.test(value)) {
    return { isValid: false }
  }

  const parts = value.split('/')
  const numerator = parseInt(parts[0], 10)
  const denominator = parseInt(parts[1], 10)

  if (numerator > denominator) {
    return { isValid: false }
  }

  return { isValid: true, numerator, denominator }
}

export const getExpression = (formula: string) => {
  const parser = new Parser()

  // Ratio (e.g. "5/13") is a string that needs to be evaluated.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  parser.functions.evalRatio = (arg: string) => {
    if (parseRatio(arg).isValid) {
      return parser.evaluate(arg)
    }
    return NaN
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  parser.functions.ratioNumerator = (arg: string) => {
    const parsed = parseRatio(arg)
    if (parsed.isValid) {
      return parsed.numerator
    }
    return NaN
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    return null
  }
}

export const evaluateFormula = (formula: string, data: GenericObjectType) => {
  try {
    const expression = getExpression(formula)
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

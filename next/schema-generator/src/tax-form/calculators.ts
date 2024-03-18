import { Parser } from 'expr-eval'

import { parseRatio } from '../form-utils/ajvFormats'

export function getTaxCalculatorExpression(formula: string) {
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

import { InputWidthType } from 'forms-shared/generator/uiOptionsTypes'
import { CSSProperties } from 'react'

/**
 * Utility from `globals.css` that turns `--expected-characters-count` into a width.
 */
export const inputWidthCharactersClassName = 'input-width-based-on-characters-count'

export const getInputWidthCharactersStyle = (inputWidth: InputWidthType) =>
  ({ '--expected-characters-count': inputWidth }) as CSSProperties

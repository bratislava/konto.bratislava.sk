import { InputWidthFraction, InputWidthType } from 'forms-shared/generator/uiOptionsTypes'
import { CSSProperties } from 'react'

/**
 * Utility from `globals.css` that turns `--expected-characters-count` into a width.
 */
export const inputWidthCharactersClassName = 'input-width-based-on-characters-count'

/**
 * Complete literal class strings. Fractions apply from `md` up and are full width below it, the
 * same way `selfColumn` is handled in `BAFieldTemplate`.
 */
export const inputWidthFractionClassNames: Record<InputWidthFraction, string> = {
  full: 'w-full',
  '3/4': 'w-full md:w-3/4',
  '2/3': 'w-full md:w-2/3',
  '1/2': 'w-full md:w-1/2',
  '1/3': 'w-full md:w-1/3',
  '1/4': 'w-full md:w-1/4',
}

/** The character arm of the union is a literal range, not a plain `number`. */
export type InputWidthCharacters = Extract<InputWidthType, number>

export const isInputWidthCharacters = (
  inputWidth?: InputWidthType,
): inputWidth is InputWidthCharacters => typeof inputWidth === 'number'

export const getInputWidthCharactersStyle = (inputWidth: InputWidthCharacters) =>
  ({ '--expected-characters-count': inputWidth }) as CSSProperties

export const getInputWidthFractionClassName = (inputWidth?: InputWidthType) =>
  inputWidthFractionClassNames[isInputWidthCharacters(inputWidth) ? 'full' : (inputWidth ?? 'full')]

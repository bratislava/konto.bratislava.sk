import {
  Button as LibraryButton,
  type ButtonAnchorProps,
  type ButtonButtonProps,
  type ButtonProps,
} from '@bratislava/component-library'

export type { ButtonAnchorProps, ButtonButtonProps, ButtonProps }

/** @deprecated Use `ButtonAnchorProps` from `@bratislava/component-library` */
export type AnchorProps = ButtonAnchorProps

/** Union of button and anchor variants (same as `ButtonProps` from the design system). */
export type PolymorphicProps = ButtonProps

export default LibraryButton

import { InputWidthType } from 'forms-shared/generator/uiOptionsTypes'
import { forwardRef, Ref } from 'react'
import { Input as RACInput, InputProps as RACInputProps } from 'react-aria-components/Input'
import {
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
} from 'react-aria-components/TextField'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import {
  getInputWidthCharactersStyle,
  getInputWidthFractionClassName,
  inputWidthCharactersClassName,
  isInputWidthCharacters,
} from './_shared/inputWidth'
import { FieldBaseProps } from './_shared/types'

export interface TextFieldProps
  extends
    Omit<RACTextFieldProps, 'spellCheck'>,
    FieldBaseProps,
    Pick<RACInputProps, 'autoCapitalize' | 'autoCorrect' | 'spellCheck'> {
  placeholder?: string
  /**
   * Width of the input, either a number of characters or a fraction of the available width.
   * Narrows only the input, never past the available space. Label, helptext and error message keep
   * the full width.
   */
  inputWidth?: InputWidthType
}

const TextField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    autoComplete,
    inputWidth,
    ...rest
  }: TextFieldProps,
  ref: Ref<HTMLInputElement>,
) => (
  <RACTextField
    {...rest}
    isInvalid={!!errorMessage}
    validationBehavior="aria"
    className={cn('flex w-full flex-col gap-2', rest.className)}
  >
    <FieldWrapper
      label={label}
      isRequired={rest.isRequired}
      displayOptionalLabel={displayOptionalLabel}
      labelSize={labelSize}
      helptext={helptext}
      helptextFooter={helptextFooter}
      errorMessage={errorMessage}
    >
      <RACInput
        ref={ref}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        spellCheck={spellCheck}
        autoComplete={autoComplete}
        data-cy={rest.name ? `input-${rest.name}` : undefined}
        style={
          isInputWidthCharacters(inputWidth) ? getInputWidthCharactersStyle(inputWidth) : undefined
        }
        className={({ isFocused, isDisabled, isInvalid }) =>
          cn(
            'rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary base-focus-ring outline-hidden lg:text-size-p-small',
            // Both set the width, so they are mutually exclusive
            isInputWidthCharacters(inputWidth)
              ? inputWidthCharactersClassName
              : getInputWidthFractionClassName(inputWidth),
            'px-3 py-2 lg:px-4 lg:py-3',
            'placeholder:text-content-passive-tertiary',
            {
              'border-border-active-default': !isInvalid && !isFocused,
              'border-border-active-focused': !isInvalid && isFocused,
              'border-border-error': isInvalid,
              'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
              'hover:border-border-active-hover': !isDisabled && !isInvalid && !isFocused,
            },
          )
        }
      />
    </FieldWrapper>
  </RACTextField>
)

export default forwardRef(TextField)

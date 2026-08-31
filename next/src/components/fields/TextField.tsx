import { CSSProperties, forwardRef, Ref } from 'react'
import { Input as RACInput, InputProps as RACInputProps } from 'react-aria-components/Input'
import {
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
} from 'react-aria-components/TextField'

import { isDefined } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface TextFieldProps
  extends
    Omit<RACTextFieldProps, 'spellCheck'>,
    FieldBaseProps,
    Pick<RACInputProps, 'autoCapitalize' | 'autoCorrect' | 'spellCheck'> {
  placeholder?: string
  /**
   * Approximate width of the input in characters. Narrows only the input, never past the available
   * space. Label, helptext and error message keep the full width.
   */
  inputSize?: number
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
    inputSize,
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
          isDefined(inputSize) ? ({ '--input-char-count': inputSize } as CSSProperties) : undefined
        }
        className={({ isFocused, isDisabled, isInvalid }) =>
          cn(
            'rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary base-focus-ring outline-hidden lg:text-size-p-small',
            // Both set the width, so they are mutually exclusive
            isDefined(inputSize) ? 'input-char-width' : 'w-full',
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

import { forwardRef, Ref } from 'react'
import {
  TextArea as RACTextArea,
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface TextAreaFieldProps extends RACTextFieldProps, FieldBaseProps {
  placeholder?: string
}

const TextAreaField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    ...rest
  }: TextAreaFieldProps,
  ref: Ref<HTMLTextAreaElement>,
) => (
  <RACTextField
    {...rest}
    isInvalid={!!errorMessage}
    validationBehavior="aria"
    className={cn('flex flex-col gap-2', rest.className)}
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
      <RACTextArea
        ref={ref}
        placeholder={placeholder}
        className={({ isFocused, isDisabled, isInvalid }) =>
          cn(
            'w-full rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
            'min-h-30 resize-y px-4 py-3 lg:px-3 lg:py-2',
            'placeholder:text-content-passive-tertiary',
            {
              'border-border-active-default': !isInvalid && !isFocused,
              'border-border-active-focused': isFocused && !isInvalid,
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

export default forwardRef(TextAreaField)

import { forwardRef, ReactNode, Ref } from 'react'
import {
  Input as RACInput,
  NumberField as RACNumberField,
  NumberFieldProps as RACNumberFieldProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface NumberFieldProps extends RACNumberFieldProps, FieldBaseProps {
  placeholder?: string
  endIcon?: ReactNode
}

const NumberField = (
  {
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    endIcon,
    ...rest
  }: NumberFieldProps,
  ref: Ref<HTMLInputElement>,
) => (
  <RACNumberField
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
      <div className="relative">
        <RACInput
          ref={ref}
          placeholder={placeholder}
          data-cy={rest.name ? `input-${rest.name}` : undefined}
          className={({ isFocused, isDisabled, isInvalid }) =>
            cn(
              'w-full rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
              'px-4 py-3 lg:px-3 lg:py-2',
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
        {endIcon ? (
          <div className="absolute inset-y-0 right-0 flex items-center">{endIcon}</div>
        ) : null}
      </div>
    </FieldWrapper>
  </RACNumberField>
)

export default forwardRef(NumberField)

import { forwardRef, ReactNode, Ref, useCallback } from 'react'
import {
  Input as RACInput,
  NumberField as RACNumberField,
  NumberFieldProps as RACNumberFieldProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldErrorMessage from './_shared/FieldErrorMessage'
import FieldHeader from './_shared/FieldHeader'
import { FieldBaseProps } from './_shared/types'

export interface NumberFieldProps
  extends Omit<RACNumberFieldProps, 'onChange' | 'value'>,
    FieldBaseProps {
  value?: number | null
  onChange?: (value: number | null) => void
  placeholder?: string
  endIcon?: ReactNode
}

const NumberField = ({
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    endIcon,
    value,
    onChange,
    ...rest
  }: NumberFieldProps,
  ref: Ref<HTMLInputElement>) => {
  const handleChange = useCallback(
    (v: number) => {
      onChange?.(Number.isNaN(v) ? null : v)
    },
    [onChange],
  )

  return (
    <RACNumberField
      {...rest}
      value={value ?? NaN}
      onChange={handleChange}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
    >
      <FieldHeader
        label={label}
        isRequired={rest.isRequired}
        displayOptionalLabel={displayOptionalLabel}
        labelSize={labelSize}
        helptext={helptext}
      />
      <div className="relative">
        <RACInput
          ref={ref}
          placeholder={placeholder}
          data-cy={rest.name ? `input-${rest.name}` : undefined}
          className={({ isFocused, isDisabled, isInvalid }) =>
            cn(
              'w-full rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary caret-content-passive-primary outline-hidden',
              'px-4 py-3 lg:px-3 lg:py-2',
              'placeholder:text-content-passive-tertiary',
              {
                'border-border-active-default': !isInvalid && !isFocused,
                'border-border-active-focused': isFocused && !isInvalid,
                'border-border-error': isInvalid,
                'border-border-active-disabled bg-background-passive-tertiary':
                  isDisabled,
                'hover:border-border-active-hover':
                  !isDisabled && !isInvalid && !isFocused,
              },
            )
          }
        />
        {endIcon}
      </div>
      {helptextFooter && (
        <div className="text-p2 text-content-passive-secondary mt-1">
          {helptextFooter}
        </div>
      )}
      <FieldErrorMessage errorMessage={errorMessage} />
    </RACNumberField>
  )
}

export default forwardRef(NumberField)

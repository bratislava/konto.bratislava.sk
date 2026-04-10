import { forwardRef, ReactNode, Ref, useCallback } from 'react'
import {
  Input as RACInput,
  TextField as RACTextField,
  TextFieldProps as RACTextFieldProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldErrorMessage from './_shared/FieldErrorMessage'
import FieldHeader from './_shared/FieldHeader'
import { FieldBaseProps } from './_shared/types'

export interface TextFieldProps extends RACTextFieldProps, FieldBaseProps {
  placeholder?: string
  endIcon?: ReactNode
  children?: ReactNode
}

const TextField = ({
    label,
    displayOptionalLabel,
    labelSize,
    helptext,
    helptextFooter,
    errorMessage,
    placeholder,
    endIcon,
    children,
    onChange,
    ...rest
  }: TextFieldProps,
  ref: Ref<HTMLInputElement>) => {
  const handleChange = useCallback(
    (value: string) => {
      onChange?.(value.startsWith(' ') ? value.trimStart() : value)
    },
    [onChange],
  )

  return (
    <RACTextField
      {...rest}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
      onChange={handleChange}
    >
      <FieldHeader
        label={label}
        isRequired={rest.isRequired}
        displayOptionalLabel={displayOptionalLabel}
        labelSize={labelSize}
        helptext={helptext}
      />
      {children ?? (
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
      )}
      {helptextFooter && (
        <div className="text-p2 text-content-passive-secondary mt-1">
          {helptextFooter}
        </div>
      )}
      <FieldErrorMessage errorMessage={errorMessage} />
    </RACTextField>
  )
}

export default forwardRef(TextField)

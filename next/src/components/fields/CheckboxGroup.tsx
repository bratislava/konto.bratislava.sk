import { ReactNode } from 'react'
import {
  Checkbox as RACCheckbox,
  CheckboxGroup as RACCheckboxGroup,
  CheckboxGroupProps as RACCheckboxGroupProps,
  CheckboxProps as RACCheckboxProps,
} from 'react-aria-components'

import cn from '@/src/utils/cn'

import FieldErrorMessage from './_shared/FieldErrorMessage'
import FieldHeader from './_shared/FieldHeader'
import { FieldBaseProps } from './_shared/types'

export interface CheckboxGroupProps extends RACCheckboxGroupProps, FieldBaseProps {
  children: ReactNode
}

export const CheckboxGroup = ({
  label,
  displayOptionalLabel,
  labelSize,
  helptext,
  helptextFooter,
  errorMessage,
  children,
  ...rest
}: CheckboxGroupProps) => {
  return (
    <RACCheckboxGroup
      {...rest}
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
      <div className="flex flex-col gap-4">{children}</div>
      {helptextFooter && (
        <div className="text-p2 text-content-passive-secondary mt-1">
          {helptextFooter}
        </div>
      )}
      <FieldErrorMessage errorMessage={errorMessage} />
    </RACCheckboxGroup>
  )
}

export interface CheckboxProps extends RACCheckboxProps {
  variant?: 'basic' | 'boxed'
}

export const Checkbox = ({
  variant = 'basic',
  children,
  className,
  ...rest
}: CheckboxProps) => {
  return (
    <RACCheckbox
      {...rest}
      className={({ isSelected, isDisabled, isInvalid, isIndeterminate }) =>
        cn(
          'group flex w-full cursor-pointer gap-3 rounded-lg text-p2',
          {
            'items-center': true,

            // boxed variant
            'border border-solid bg-background-passive-base p-3 lg:px-3 lg:py-2':
              variant === 'boxed',

            // boxed border colors
            'border-border-active-default':
              variant === 'boxed' && !isSelected && !isIndeterminate && !isInvalid,
            'border-border-active-primary-default':
              variant === 'boxed' && (isSelected || isIndeterminate) && !isInvalid,
            'border-border-error': variant === 'boxed' && isInvalid,

            // hover
            'hover:border-border-active-hover':
              variant === 'boxed' &&
              !isSelected &&
              !isIndeterminate &&
              !isDisabled &&
              !isInvalid,

            // disabled
            'opacity-50 cursor-default': isDisabled,
            'border-border-active-disabled bg-background-passive-tertiary':
              isDisabled && variant === 'boxed',
          },
          className,
        )
      }
    >
      {({ isSelected, isDisabled, isInvalid, isIndeterminate, isFocusVisible }) => (
        <>
          <div
            className={cn(
              'grid size-6 min-h-6 min-w-6 place-content-center self-start rounded',
              {
                'border-2 border-border-active-primary-default':
                  !isSelected && !isIndeterminate && !isInvalid,
                'border-2 border-border-error':
                  !isSelected && !isIndeterminate && isInvalid,
                'bg-background-active-primary-default':
                  (isSelected || isIndeterminate) && !isInvalid,
                'bg-background-error-default':
                  (isSelected || isIndeterminate) && isInvalid,
                'opacity-50': isDisabled,
                'ring-2 ring-offset-2': isFocusVisible,
              },
            )}
          >
            {isSelected && (
              <svg
                viewBox="0 0 18 18"
                aria-hidden="true"
                className="size-4 fill-none stroke-white stroke-[3px]"
              >
                <polyline points="2 9 7 14 16 4" />
              </svg>
            )}
            {isIndeterminate && (
              <svg
                viewBox="0 0 18 18"
                aria-hidden="true"
                className="size-4 fill-white stroke-none"
              >
                <rect x={1} y={7.5} width={16} height={3} />
              </svg>
            )}
          </div>
          {children}
        </>
      )}
    </RACCheckbox>
  )
}

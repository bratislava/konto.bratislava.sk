import { InputWidthType } from 'forms-shared/generator/uiOptionsTypes'
import { forwardRef, Ref, useId } from 'react'
import { Group as RACGroup } from 'react-aria-components/Group'
import { Input as RACInput } from 'react-aria-components/Input'
import {
  NumberField as RACNumberField,
  NumberFieldProps as RACNumberFieldProps,
} from 'react-aria-components/NumberField'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import {
  getInputWidthCharactersStyle,
  getInputWidthFractionClassName,
  inputWidthCharactersClassName,
  isInputWidthCharacters,
} from './_shared/inputWidth'
import { FieldBaseProps } from './_shared/types'

export interface NumberFieldProps extends RACNumberFieldProps, FieldBaseProps {
  placeholder?: string
  unit?: string
  /**
   * Width of the input, either a number of characters or a fraction of the available width.
   * Narrows only the input, never past the available space. Label, helptext and error message keep
   * the full width.
   */
  inputWidth?: InputWidthType
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
    unit,
    inputWidth,
    ...rest
  }: NumberFieldProps,
  ref: Ref<HTMLInputElement>,
) => {
  const unitId = useId()
  const isCharactersWidth = isInputWidthCharacters(inputWidth)

  return (
    <RACNumberField
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
        {unit ? (
          <RACGroup
            className={({ isFocusWithin, isInvalid, isDisabled, isHovered }) =>
              cn(
                'flex overflow-hidden rounded-lg border bg-background-passive-base base-focus-ring',
                // A character count must size the typing area alone, so the group shrink-wraps the
                // input plus the unit. A fraction sizes the whole control, so it goes on the group.
                isCharactersWidth ? 'w-fit max-w-full' : getInputWidthFractionClassName(inputWidth),
                {
                  'border-border-active-default': !isInvalid && !isFocusWithin,
                  'border-border-active-focused': !isInvalid && isFocusWithin,
                  'border-border-error': isInvalid,
                  'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
                  'border-border-active-hover':
                    !isDisabled && !isInvalid && !isFocusWithin && isHovered,
                },
              )
            }
          >
            {({ isFocusWithin, isInvalid, isDisabled }) => (
              <>
                <RACInput
                  ref={ref}
                  placeholder={placeholder}
                  // Thanks to aria-describedby, screen readers will read the suffix value after announcing the label, with a short pause.
                  aria-describedby={unitId}
                  data-cy={rest.name ? `number-${rest.name}` : undefined}
                  style={isCharactersWidth ? getInputWidthCharactersStyle(inputWidth) : undefined}
                  className={cn(
                    'min-w-0 bg-transparent text-size-p-small-r text-content-passive-secondary outline-hidden lg:text-size-p-small',
                    isCharactersWidth ? inputWidthCharactersClassName : 'flex-1',
                    'px-3 py-2 lg:px-4 lg:py-3',
                    'placeholder:text-content-passive-tertiary',
                  )}
                />
                <div
                  id={unitId}
                  className={cn(
                    'flex items-center self-stretch border-l px-3 font-semibold text-content-passive-secondary lg:px-4',
                    {
                      'border-border-active-default': !isInvalid && !isFocusWithin,
                      'border-border-active-focused': !isInvalid && isFocusWithin,
                      'border-border-error': isInvalid,
                      'border-border-active-disabled bg-background-passive-tertiary': isDisabled,
                    },
                  )}
                >
                  {unit}
                </div>
              </>
            )}
          </RACGroup>
        ) : (
          <RACInput
            ref={ref}
            placeholder={placeholder}
            data-cy={rest.name ? `number-${rest.name}` : undefined}
            style={isCharactersWidth ? getInputWidthCharactersStyle(inputWidth) : undefined}
            className={({ isFocused, isDisabled, isInvalid }) =>
              cn(
                'rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary base-focus-ring outline-hidden lg:text-size-p-small',
                // Both set the width, so they are mutually exclusive
                isCharactersWidth
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
        )}
      </FieldWrapper>
    </RACNumberField>
  )
}

export default forwardRef(NumberField)

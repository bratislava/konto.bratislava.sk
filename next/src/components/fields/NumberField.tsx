import { forwardRef, ReactNode, Ref, useId } from 'react'
import { ButtonContext } from 'react-aria-components/Button'
import { Group as RACGroup } from 'react-aria-components/Group'
import { Input as RACInput } from 'react-aria-components/Input'
import {
  NumberField as RACNumberField,
  NumberFieldProps as RACNumberFieldProps,
} from 'react-aria-components/NumberField'

import cn from '@/src/utils/cn'

import FieldWrapper from './_shared/FieldWrapper'
import { FieldBaseProps } from './_shared/types'

export interface NumberFieldProps extends RACNumberFieldProps, FieldBaseProps {
  placeholder?: string
  endIcon?: ReactNode
  unit?: string
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
    unit,
    ...rest
  }: NumberFieldProps,
  ref: Ref<HTMLInputElement>,
) => {
  const unitId = useId()

  return (
    <RACNumberField
      {...rest}
      isInvalid={!!errorMessage}
      validationBehavior="aria"
      className={cn('flex w-full flex-col gap-2', rest.className)}
    >
      {/*
       * RAC's NumberField provides a ButtonContext with `increment` and `decrement` slots for stepper
       * buttons. Any RAC-based Button rendered as a React descendant (e.g. in RJSF array templates)
       * will try to consume this context and throw "A slot prop is required. Valid slot names are
       * "increment" and "decrement"." if no valid slot is set.
       * Since we don't render stepper buttons, we reset the context to `null` to opt out.
       * If we want to render stepper button in future, this hotfix needs to be removed.
       * TODO A way to fix can be adding default slot={props.slot ?? null} to Button from @bratislava/component-library.
       */}
      <ButtonContext.Provider value={null as never}>
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
                  'flex w-full overflow-hidden rounded-lg border bg-background-passive-base base-focus-ring',
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
                    className={cn(
                      'min-w-0 flex-1 bg-transparent text-size-p-small-r text-content-passive-secondary outline-hidden lg:text-size-p-small',
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
            <div className="relative">
              <RACInput
                ref={ref}
                placeholder={placeholder}
                data-cy={rest.name ? `number-${rest.name}` : undefined}
                className={({ isFocused, isDisabled, isInvalid }) =>
                  cn(
                    'w-full rounded-lg border bg-background-passive-base text-size-p-small-r text-content-passive-secondary base-focus-ring outline-hidden lg:text-size-p-small',
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
              {endIcon ? (
                <div className="absolute inset-y-0 right-0 flex items-center">{endIcon}</div>
              ) : null}
            </div>
          )}
        </FieldWrapper>
      </ButtonContext.Provider>
    </RACNumberField>
  )
}

export default forwardRef(NumberField)

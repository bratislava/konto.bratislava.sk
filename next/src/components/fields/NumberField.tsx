import { forwardRef, ReactNode, Ref } from 'react'
import {
  ButtonContext,
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
        <div className="relative">
          <RACInput
            ref={ref}
            placeholder={placeholder}
            data-cy={rest.name ? `number-${rest.name}` : undefined}
            className={({ isFocused, isDisabled, isInvalid }) =>
              cn(
                'w-full rounded-lg border bg-background-passive-base text-p2 text-content-passive-secondary outline-hidden',
                'px-3 py-2 lg:px-4 lg:py-3',
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
    </ButtonContext.Provider>
  </RACNumberField>
)

export default forwardRef(NumberField)

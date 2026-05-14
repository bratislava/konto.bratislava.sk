import { useObjectRef } from '@react-aria/utils'
import { useControlledState } from '@react-stately/utils'
import { forwardRef, ReactNode } from 'react'
import { useLocale } from 'react-aria/I18nProvider'
import { useNumberField } from 'react-aria/useNumberField'
import {
  NumberFieldStateOptions as RACNumberFieldStateOptions,
  useNumberFieldState,
} from 'react-stately/useNumberFieldState'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

export type NumberFieldProps = FieldWrapperProps & {
  name?: string
  value?: number | null
  onChange?: (value: number | null) => void
  endIcon?: ReactNode
  placeholder?: string
  className?: string
} & Pick<RACNumberFieldStateOptions, 'minValue' | 'maxValue' | 'step' | 'formatOptions'>

/**
 * This is a temporary implementation of the NumberField component. Most of the code is copied from InputField and
 * adjusted for numbers.
 *
 * TODO: Share the common logic between InputField and NumberField in a separate component.
 *
 * The component handles conversion between our `null` value and React Aria's `NaN` value.
 */
const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ name, value, onChange, endIcon, placeholder, className, ...rest }, forwardedRef) => {
    const ref = useObjectRef(forwardedRef)
    const { locale } = useLocale()

    const [valueControlled, setValueControlled] = useControlledState(value, null, onChange)

    // React Aria's NumberField uses NaN as a value for empty input fields
    // https://github.com/adobe/react-spectrum/issues/5524
    const sharedProps = {
      ...rest,
      placeholder,
      value: valueControlled ?? NaN,
      description: rest.helptext,
      onChange: (newValue: number) => {
        setValueControlled(Number.isNaN(newValue) ? null : newValue)
      },
      isWheelDisabled: true,
    }
    const state = useNumberFieldState({
      ...sharedProps,
      locale,
    })

    const { labelProps, inputProps, descriptionProps, errorMessageProps } = useNumberField(
      sharedProps,
      state,
      ref,
    )

    const style = cn(
      'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-size-p-small-r caret-gray-700 focus:border-gray-700 focus:outline-hidden focus:placeholder:opacity-0 sm:px-4 sm:py-2.5 lg:text-size-p-small',
      {
        // hover
        'hover:border-gray-400': !rest.isDisabled,

        // error
        'border-negative-700 hover:border-negative-700 focus:border-negative-700':
          rest.errorMessage?.length && !rest.isDisabled,

        // disabled
        'border-gray-300 bg-gray-100': rest.isDisabled,
      },
      className,
    )

    return (
      <FieldWrapper
        {...rest}
        labelProps={labelProps}
        htmlFor={inputProps.id}
        descriptionProps={descriptionProps}
        errorMessageProps={errorMessageProps}
      >
        <div className="relative" data-cy={`required-${name}`}>
          <input
            {...inputProps}
            ref={ref}
            name={inputProps.id}
            className={style}
            data-cy={`number-${name}`}
          />
          {endIcon}
        </div>
      </FieldWrapper>
    )
  },
)

export default NumberField

import { useObjectRef } from '@react-aria/utils'
import { forwardRef, ReactNode, useEffect, useState } from 'react'
import { AriaTextFieldOptions, useTextField } from 'react-aria'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

export type InputType = 'text' | 'password' | 'email' | 'tel'

export type InputFieldProps = FieldWrapperProps & {
  type?: InputType // capitalize input value after field un-focus with type === text
  name?: string
  capitalize?: boolean
  value?: string
  onChange?: (value?: string) => void
  onBlur?: () => void
  endIcon?: ReactNode
  autoComplete?: string
  autoCapitalize?: AriaTextFieldOptions<'input'>['autoCapitalize']
  autoCorrect?: AriaTextFieldOptions<'input'>['autoCorrect']
  placeholder?: string
  className?: string
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      type = 'text',
      name,
      capitalize = false,
      value = '',
      onChange,
      endIcon,
      autoComplete,
      autoCapitalize,
      autoCorrect,
      placeholder,
      className,
      ...rest
    },
    forwardedRef,
  ) => {
    const ref = useObjectRef(forwardedRef)
    const [valueState, setValueState] = useState<string>(value)

    useEffect(() => {
      setValueState(onChange ? value : valueState)
    }, [valueState, value, onChange])

    const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
      {
        ...rest,
        placeholder,
        value: onChange && value ? value : valueState,
        type,
        description: rest.helptext,
        onChange(inputValue) {
          if (onChange) {
            onChange(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
          } else {
            setValueState(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
          }
        },
        onFocusChange(isFocused) {
          if (!isFocused && type === 'text' && capitalize) {
            if (onChange) {
              onChange(valueState.replace(/^\w/, (c) => c.toUpperCase()))
            } else {
              setValueState(valueState.replace(/^\w/, (c) => c.toUpperCase()))
            }
          }
        },
        autoComplete,
        autoCapitalize,
        autoCorrect,
      },
      ref,
    )

    const style = cn(
      'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-16 caret-gray-700 focus:border-gray-700 focus:outline-hidden focus:placeholder:opacity-0 sm:px-4 sm:py-2.5',
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
            data-cy={`input-${name}`}
          />
          {endIcon}
        </div>
      </FieldWrapper>
    )
  },
)

export default InputField

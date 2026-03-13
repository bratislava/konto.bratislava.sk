import React, { useState } from 'react'
import { useTextField } from 'react-aria'

import FieldWrapper, { FieldWrapperProps } from '@/src/components/widget-components/FieldWrapper'
import cn from '@/src/utils/cn'

type TextAreaBase = FieldWrapperProps & {
  defaultValue?: string
  value?: string
  onChange?: (value?: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

const TextAreaField = ({
  defaultValue,
  value,
  onChange,
  placeholder,
  className,
  ...rest
}: TextAreaBase) => {
  const [valueState, setValueState] = useState<string>('')
  const [useDefaultValue, setUseDefaultValue] = useState<boolean>(true)
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  const displayValue =
    useDefaultValue && defaultValue && !value ? defaultValue : onChange ? value : valueState

  const { labelProps, inputProps, descriptionProps, errorMessageProps } = useTextField(
    {
      ...rest,
      placeholder,
      value: displayValue,
      description: rest.helptext,
      inputElementType: 'textarea',
      onChange(inputValue) {
        if (onChange) {
          onChange(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
        } else {
          setValueState(inputValue.startsWith(' ') ? inputValue.trim() : inputValue)
        }
        setUseDefaultValue(false)
      },
      onFocusChange: (value) => {
        setIsFocused(value)
      },
      isRequired: rest.required,
      isDisabled: rest.disabled,
    },
    ref,
  )
  const containerStyle = cn(
    'flex resize-none flex-col overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-0 text-p3 caret-gray-700 focus:border-gray-700 focus:outline-hidden sm:text-16',
    {
      'hover:border-gray-400': !rest.disabled && !isFocused,
      'border-negative-700 hover:border-negative-700 focus:border-negative-700':
        rest.errorMessage?.length && !rest.disabled,
      'border-gray-700 hover:border-gray-700': !rest.disabled && isFocused,
    },
    className,
  )

  const textareaStyle = cn(
    'h-full w-full resize-none overflow-y-scroll rounded-lg bg-white px-3 py-2 caret-gray-700 focus:outline-hidden focus:placeholder:text-transparent sm:px-4 sm:py-3',
    {
      'border-gray-300 bg-gray-100': rest.disabled,
    },
  )

  return (
    <div className="flex w-full flex-col">
      <FieldWrapper
        {...rest}
        labelProps={labelProps}
        htmlFor={inputProps.id}
        descriptionProps={descriptionProps}
        errorMessageProps={errorMessageProps}
      >
        <div className={containerStyle}>
          <textarea {...inputProps} ref={ref} name={inputProps.id} className={textareaStyle} />
        </div>
      </FieldWrapper>
    </div>
  )
}

export default TextAreaField

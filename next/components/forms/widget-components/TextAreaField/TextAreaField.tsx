import React, { useState } from 'react'
import { useTextField } from 'react-aria'

import FieldWrapper, { FieldWrapperProps } from '@/components/forms/widget-components/FieldWrapper'
import cn from '@/frontend/cn'

type TextAreaBase = FieldWrapperProps & {
  defaultValue?: string
  value?: string
  onChange?: (value?: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

const TextAreaField = ({
  label,
  placeholder,
  errorMessage = [],
  helptext,
  helptextMarkdown,
  helptextFooter,
  helptextFooterMarkdown,
  tooltip,
  required,
  value,
  disabled,
  className,
  defaultValue,
  onChange,
  size,
  labelSize,
  displayOptionalLabel,
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
      label,
      errorMessage,
      description: helptext,
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
      isRequired: required,
      isDisabled: disabled,
    },
    ref,
  )
  const containerStyle = cn(
    'flex resize-none flex-col overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-0 text-p3 caret-gray-700 focus:border-gray-700 focus:outline-hidden sm:text-16',
    {
      'hover:border-gray-400': !disabled && !isFocused,
      'border-negative-700 hover:border-negative-700 focus:border-negative-700':
        errorMessage?.length > 0 && !disabled,
      'border-gray-700 hover:border-gray-700': !disabled && isFocused,
    },
    className,
  )

  const textareaStyle = cn(
    'h-full w-full resize-none overflow-y-scroll rounded-lg bg-white px-3 py-2 caret-gray-700 focus:outline-hidden focus:placeholder:text-transparent sm:px-4 sm:py-3',
    {
      'border-gray-300 bg-gray-100': disabled,
    },
  )
  return (
    <div className="flex w-full flex-col">
      <FieldWrapper
        label={label}
        labelProps={labelProps}
        htmlFor={inputProps.id}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        descriptionProps={descriptionProps}
        required={required}
        tooltip={tooltip}
        disabled={disabled}
        errorMessage={errorMessage}
        errorMessageProps={errorMessageProps}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel={displayOptionalLabel}
      >
        <div className={containerStyle}>
          <textarea {...inputProps} ref={ref} name={inputProps.id} className={textareaStyle} />
        </div>
      </FieldWrapper>
    </div>
  )
}

export default TextAreaField

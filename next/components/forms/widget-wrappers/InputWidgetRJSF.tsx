import { WidgetProps } from '@rjsf/utils'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import InputField from '@/components/forms/widget-components/InputField/InputField'
import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

interface InputWidgetRJSFProps extends WidgetProps {
  options: InputUiOptions
  value: string | undefined
  onChange: (value?: string) => void
}

const InputWidgetRJSF = ({
  id,
  label,
  options,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
  name,
}: InputWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    inputType,
    size,
    labelSize,
  } = options

  const handleOnChange = (newValue: string | undefined) => {
    if (newValue && newValue !== '') {
      onChange(newValue)
    } else {
      onChange()
    }
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <InputField
        name={name}
        label={label}
        type={inputType}
        placeholder={placeholder}
        value={value ?? undefined}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        tooltip={tooltip}
        className={className}
        resetIcon={resetIcon}
        leftIcon={leftIcon}
        onChange={handleOnChange}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel
      />
    </WidgetWrapper>
  )
}
export default InputWidgetRJSF

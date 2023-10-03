import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { InputFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

interface InputFieldWidgetRJSFProps extends WidgetProps {
  options: InputFieldUiOptions
  value: string | null
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
}

const InputFieldWidgetRJSF = ({
  label,
  options,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
}: InputFieldWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    explicitOptional,
    type,
    size = 'default',
  } = options

  const handleOnChange = (newValue?: string) => {
    if (newValue && newValue !== '') {
      onChange(newValue)
    } else {
      onChange()
    }
  }

  return (
    <WidgetWrapper options={options}>
      <InputField
        label={label}
        type={type}
        placeholder={placeholder}
        value={value ?? undefined}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        tooltip={tooltip}
        className={className}
        resetIcon={resetIcon}
        leftIcon={leftIcon}
        onChange={handleOnChange}
        explicitOptional={explicitOptional}
        size={size}
      />
    </WidgetWrapper>
  )
}
export default InputFieldWidgetRJSF

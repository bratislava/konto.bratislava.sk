import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

type InputFieldRJSFOptions = {
  type?: 'text' | 'password'
  resetIcon?: boolean
  leftIcon?: 'person' | 'mail' | 'call' | 'lock'
  size?: 'large' | 'default' | 'small'
} & WidgetOptions

interface InputFieldWidgetRJSFProps extends WidgetProps {
  label: string
  options: InputFieldRJSFOptions
  value: string | null
  required?: boolean
  disabled?: boolean
  placeholder?: string
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
  rawErrors?: string[]
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
}: InputFieldWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    accordion,
    explicitOptional,
    type,
    size = 'default',
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

  const handleOnChange = (newValue?: string) => {
    if (newValue && newValue !== '') {
      onChange(newValue)
    } else {
      onChange()
    }
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <InputField
        label={label}
        type={type}
        placeholder={placeholder}
        value={value ?? undefined}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled}
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

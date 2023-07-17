import { WidgetProps } from '@rjsf/utils'
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
  options: InputFieldRJSFOptions
  value: string | null
  onChange: (value?: string) => void
}

const InputFieldWidgetRJSF = ({
  options: {
    helptext,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    explicitOptional,
    type,
    size = 'default',
    accordion,
    spaceBottom = 'none',
    spaceTop = 'large',
  },
  label,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
}: InputFieldWidgetRJSFProps) => {
  const handleOnChange = (newValue?: string) => {
    onChange(newValue || undefined)
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <InputField
        value={value ?? undefined}
        onChange={handleOnChange}
        errorMessage={rawErrors}
        label={label}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        className={className}
        resetIcon={resetIcon}
        leftIcon={leftIcon}
        explicitOptional={explicitOptional}
        size={size}
      />
    </WidgetWrapper>
  )
}
export default InputFieldWidgetRJSF

import { InputUiOptions } from '@forms-shared/generator/uiOptionsTypes'
import { WidgetProps } from '@rjsf/utils'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

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
    helptextHeader,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    type,
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
      <FieldBlurWrapper value={value} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <InputField
            name={name}
            label={label}
            type={type}
            placeholder={placeholder}
            value={wrapperValue ?? undefined}
            errorMessage={rawErrors}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            helptextHeader={helptextHeader}
            tooltip={tooltip}
            className={className}
            resetIcon={resetIcon}
            leftIcon={leftIcon}
            onChange={wrapperOnChange}
            onBlur={onBlur}
            size={size}
            labelSize={labelSize}
            displayOptionalLabel
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}
export default InputWidgetRJSF

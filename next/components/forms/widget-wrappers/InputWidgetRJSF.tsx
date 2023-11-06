import { WidgetProps } from '@rjsf/utils'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { InputUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

interface InputWidgetRJSFProps extends WidgetProps {
  options: InputUiOptions & WidgetProps['options']
  value: string | undefined
  onChange: (value?: string) => void
}

const InputWidgetRJSF = ({
  label,
  options,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
}: InputWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    explicitOptional,
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
    <WidgetWrapper options={options}>
      <FieldBlurWrapper value={value} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <InputField
            label={label}
            type={type}
            placeholder={placeholder}
            value={wrapperValue ?? undefined}
            errorMessage={rawErrors}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            tooltip={tooltip}
            className={className}
            resetIcon={resetIcon}
            leftIcon={leftIcon}
            onChange={wrapperOnChange}
            onBlur={onBlur}
            explicitOptional={explicitOptional}
            size={size}
            labelSize={labelSize}
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}
export default InputWidgetRJSF

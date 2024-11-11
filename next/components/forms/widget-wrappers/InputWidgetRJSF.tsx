import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

interface InputWidgetRJSFProps extends WidgetProps {
  schema: StrictRJSFSchema & { uiOptions: InputUiOptions }
  value: string | undefined
  onChange: (value?: string) => void
}

const InputWidgetRJSF = ({
  id,
  label,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
  name,
  schema,
}: InputWidgetRJSFProps) => {
  const {
    helptext,
    helptextHeader,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    inputType,
    size,
    labelSize,
  } = schema.uiOptions

  const handleOnChange = (newValue: string | undefined) => {
    if (newValue && newValue !== '') {
      onChange(newValue)
    } else {
      onChange()
    }
  }

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
      <FieldBlurWrapper value={value} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <InputField
            name={name}
            label={label}
            type={inputType}
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

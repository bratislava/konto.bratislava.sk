import { WidgetProps } from '@rjsf/utils'
import InputField from 'components/forms/widget-components/InputField/InputField'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import { isDefined } from '../../../frontend/utils/general'
import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

interface NumberWidgetRJSFProps extends WidgetProps {
  options: NumberUiOptions
  value: number | undefined
  onChange: (value?: number) => void
}

const NumberWidgetRJSF = ({
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
}: NumberWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    size,
    labelSize,
  } = options

  const handleOnChange = (newValue: number | undefined) => {
    if (isDefined(newValue)) {
      onChange(newValue)
    } else {
      onChange()
    }
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <FieldBlurWrapper value={value} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          // TODO: Create a specialized NumberField component
          <InputField
            name={name}
            label={label}
            type="number"
            placeholder={placeholder}
            // @ts-expect-error InputField expects string, a new NumberField is needed
            value={wrapperValue ?? undefined}
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
            // @ts-expect-error InputField expects string, a new NumberField is needed
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
export default NumberWidgetRJSF

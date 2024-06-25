import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import DatePicker from 'components/forms/widget-components/DateTimePicker/DatePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { DatePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

interface DatePickerWidgetRJSFProps extends WidgetProps {
  label: string
  options: DatePickerUiOptions
  value: string | null
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
}

const DatePickerWidgetRJSF = ({
  id,
  label,
  options,
  rawErrors,
  required,
  disabled,
  value,
  onChange,
  readonly,
}: DatePickerWidgetRJSFProps) => {
  const { helptext, helptextHeader, tooltip, size, labelSize } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <DatePicker
        label={label}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        helptextHeader={helptextHeader}
        tooltip={tooltip}
        value={value ?? null}
        onChange={(value) => onChange(value ?? undefined)}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel
      />
    </WidgetWrapper>
  )
}
export default DatePickerWidgetRJSF

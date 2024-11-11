import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import DatePicker from 'components/forms/widget-components/DateTimePicker/DatePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { DatePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

interface DatePickerWidgetRJSFProps extends WidgetProps {
  label: string
  value: string | null
  errorMessage?: string
  schema: StrictRJSFSchema & { uiOptions: DatePickerUiOptions }
  onChange: (value?: string) => void
}

const DatePickerWidgetRJSF = ({
  id,
  label,
  rawErrors,
  required,
  disabled,
  value,
  onChange,
  readonly,
  schema,
}: DatePickerWidgetRJSFProps) => {
  const { helptext, helptextHeader, tooltip, size, labelSize } = schema.uiOptions

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
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

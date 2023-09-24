import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import DatePicker from 'components/forms/widget-components/DateTimePicker/DatePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

type DatePickerRJSFOptions = WidgetOptions

interface DatePickerWidgetRJSFProps extends WidgetProps {
  label: string
  options: DatePickerRJSFOptions
  value: string | null
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
}

const DatePickerWidgetRJSF = ({
  label,
  options,
  rawErrors,
  required,
  disabled,
  value,
  onChange,
  readonly,
}: DatePickerWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    explicitOptional,
    accordion,
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <DatePicker
        label={label}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        tooltip={tooltip}
        explicitOptional={explicitOptional}
        value={value ?? null}
        onChange={(value) => onChange(value ?? undefined)}
      />
    </WidgetWrapper>
  )
}
export default DatePickerWidgetRJSF

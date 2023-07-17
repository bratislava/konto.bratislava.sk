import { DateValue } from '@internationalized/date'
import { WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import DatePicker from 'components/forms/widget-components/DateTimePicker/DatePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

type DatePickerRJSFOptions = WidgetOptions

interface DatePickerWidgetRJSFProps extends WidgetProps {
  options: DatePickerRJSFOptions
  value: string | null
  onChange: (value?: string) => void
}

const DatePickerWidgetRJSF = ({
  options: {
    helptext,
    tooltip,
    explicitOptional,
    accordion,
    spaceBottom = 'none',
    spaceTop = 'large',
  },
  label,
  rawErrors,
  required,
  disabled,
  value,
  onChange,
}: DatePickerWidgetRJSFProps) => {
  const handleOnChange = (newValue?: DateValue) =>
    newValue ? onChange(newValue.toString()) : onChange()

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <DatePicker
        label={label}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        explicitOptional={explicitOptional}
        value={value ?? undefined}
        onChange={handleOnChange}
      />
    </WidgetWrapper>
  )
}
export default DatePickerWidgetRJSF

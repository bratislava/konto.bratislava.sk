import { WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import TimePicker from 'components/forms/widget-components/DateTimePicker/TimePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

type TimePickerRJSFOptions = WidgetOptions

interface TimePickerWidgetRJSFProps extends WidgetProps {
  options: TimePickerRJSFOptions
  value: string | null
  onChange: (value?: string) => void
}

const TimePickerWidgetRJSF = ({
  options: {
    helptext,
    tooltip,
    accordion,
    explicitOptional,
    spaceBottom = 'none',
    spaceTop = 'large',
  },
  label,
  rawErrors = [],
  required,
  disabled,
  value,
  onChange,
}: TimePickerWidgetRJSFProps) => {
  const handleOnChange = (newValue?: string) => {
    onChange(newValue || undefined)
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <TimePicker
        value={value ?? undefined}
        onChange={handleOnChange}
        errorMessage={rawErrors}
        label={label}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        explicitOptional={explicitOptional}
      />
    </WidgetWrapper>
  )
}
export default TimePickerWidgetRJSF

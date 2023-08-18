import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import TimePicker from 'components/forms/widget-components/DateTimePicker/TimePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

type TimePickerRJSFOptions = WidgetOptions

interface TimePickerWidgetRJSFProps extends WidgetProps {
  options: TimePickerRJSFOptions
  value: string | null
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: string) => void
}

const TimePickerWidgetRJSF = ({
  label,
  options,
  rawErrors = [],
  required,
  disabled,
  value,
  onChange,
}: TimePickerWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    accordion,
    explicitOptional,
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <TimePicker
        label={label}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled}
        helptext={helptext}
        tooltip={tooltip}
        explicitOptional={explicitOptional}
        value={value ?? null}
        onChange={(value) => onChange(value ?? undefined)}
      />
    </WidgetWrapper>
  )
}
export default TimePickerWidgetRJSF

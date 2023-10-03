import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import TimePicker from 'components/forms/widget-components/DateTimePicker/TimePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { TimePickerUiOptions } from 'schema-generator/generator/uiOptionsTypes'

interface TimePickerWidgetRJSFProps extends WidgetProps {
  options: TimePickerUiOptions
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
  readonly,
}: TimePickerWidgetRJSFProps) => {
  const {
    helptext,
    tooltip,
    accordion,
    additionalLinks,
    explicitOptional,
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

  return (
    <WidgetWrapper
      accordion={accordion}
      additionalLinks={additionalLinks}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
    >
      <TimePicker
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
export default TimePickerWidgetRJSF

import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import TimePicker from 'components/forms/widget-components/DateTimePicker/TimePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { TimePickerUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

interface TimePickerWidgetRJSFProps extends WidgetProps {
  options: TimePickerUiOptions & WidgetProps['options']
  value: string | undefined
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
  const { helptext, tooltip, explicitOptional } = options

  return (
    <WidgetWrapper options={options}>
      <FieldBlurWrapper value={value} onChange={onChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <TimePicker
            label={label}
            errorMessage={rawErrors}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            tooltip={tooltip}
            explicitOptional={explicitOptional}
            value={wrapperValue ?? null}
            onChange={(value) => wrapperOnChange(value ?? undefined)}
            onBlur={onBlur}
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}
export default TimePickerWidgetRJSF

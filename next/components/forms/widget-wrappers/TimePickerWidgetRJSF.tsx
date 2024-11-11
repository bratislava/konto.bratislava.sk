import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import TimePicker from 'components/forms/widget-components/DateTimePicker/TimePicker'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { TimePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import FieldBlurWrapper from '../widget-components/FieldBlurWrapper/FieldBlurWrapper'

interface TimePickerWidgetRJSFProps extends WidgetProps {
  schema: StrictRJSFSchema & { uiOptions: TimePickerUiOptions }
  value: string | undefined
  errorMessage?: string
  onChange: (value?: string) => void
}

const TimePickerWidgetRJSF = ({
  id,
  label,
  options,
  rawErrors = [],
  required,
  disabled,
  value,
  onChange,
  readonly,
  schema,
}: TimePickerWidgetRJSFProps) => {
  const { helptext, helptextHeader, tooltip, size, labelSize } = schema.uiOptions

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
      <FieldBlurWrapper value={value} onChange={onChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <TimePicker
            label={label}
            errorMessage={rawErrors}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            helptextHeader={helptextHeader}
            tooltip={tooltip}
            value={wrapperValue ?? null}
            onChange={(value) => wrapperOnChange(value ?? undefined)}
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
export default TimePickerWidgetRJSF

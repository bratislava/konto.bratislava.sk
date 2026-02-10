import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { TimePickerUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import TimePicker from '@/components/forms/widget-components/DateTimePicker/TimePicker'
import FieldBlurWrapper from '@/components/forms/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

interface TimePickerWidgetRJSFProps extends WidgetProps {
  options: TimePickerUiOptions
  value: string | undefined
  errorMessage?: string
  schema: StrictRJSFSchema
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
}: TimePickerWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    tooltip,
    size,
    labelSize,
  } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <FieldBlurWrapper value={value} onChange={onChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <TimePicker
            label={label}
            errorMessage={rawErrors}
            required={required}
            disabled={disabled || readonly}
            helptext={helptext}
            helptextMarkdown={helptextMarkdown}
            helptextFooter={helptextFooter}
            helptextFooterMarkdown={helptextFooterMarkdown}
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

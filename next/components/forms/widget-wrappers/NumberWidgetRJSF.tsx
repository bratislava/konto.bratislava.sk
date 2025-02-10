import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import NumberField from '../widget-components/NumberField/NumberField'

interface NumberWidgetRJSFProps extends WidgetProps {
  options: NumberUiOptions
  value: number | undefined
  onChange: (value?: number) => void
}

const NumberWidgetRJSF = ({
  id,
  schema,
  label,
  options,
  placeholder = '',
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
  name,
}: NumberWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    tooltip,
    className,
    resetIcon,
    leftIcon,
    size,
    labelSize,
  } = options

  return (
    <WidgetWrapper id={id} options={options}>
      <NumberField
        name={name}
        label={label}
        placeholder={placeholder}
        value={value ?? null}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        tooltip={tooltip}
        className={className}
        resetIcon={resetIcon}
        leftIcon={leftIcon}
        onChange={(newValue) => onChange(newValue ?? undefined)}
        size={size}
        labelSize={labelSize}
        displayOptionalLabel
        minValue={schema.minimum}
        maxValue={schema.maximum}
        formatOptions={options.formatOptions}
        // `multipleOf` is required form schema.type === 'number' and optional for schema.type === 'integer', we add
        // `step` attribute only for integer values if not present
        step={schema.multipleOf ?? (schema.type === 'integer' ? 1 : undefined)}
      />
    </WidgetWrapper>
  )
}
export default NumberWidgetRJSF

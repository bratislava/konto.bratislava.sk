import { WidgetProps } from '@rjsf/utils'
import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

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

  const getStep = () => {
    if (schema.multipleOf != null) {
      return schema.multipleOf
    }
    // `multipleOf` is required form schema.type === 'number' and optional for schema.type === 'integer', we add
    // `step` attribute only for integer values if not present
    if (schema.type === 'integer') {
      return 1
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined
  }

  const getFormatOptions = () => {
    // Ensure that no fraction digits can be entered to integer field
    if (schema.type === 'integer' && !options.formatOptions?.maximumFractionDigits) {
      return { ...options.formatOptions, maximumFractionDigits: 0 }
    }

    return options.formatOptions
  }

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
        formatOptions={getFormatOptions()}
        step={getStep()}
      />
    </WidgetWrapper>
  )
}
export default NumberWidgetRJSF

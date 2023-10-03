import { EnumOptionsType, StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { RadioButtonUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import Radio from '../widget-components/RadioButton/Radio'
import RadioGroup from '../widget-components/RadioButton/RadioGroup'

interface RadioButtonFieldWidgetRJSFProps extends WidgetProps {
  options: RadioButtonUiOptions
  value: string | null
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: string | boolean | number | undefined) => void
}

const RadioButtonsWidgetRJSF = (props: RadioButtonFieldWidgetRJSFProps) => {
  const { options, value, onChange, label, rawErrors, required, readonly } = props
  const {
    enumOptions,
    className,
    variant,
    accordion,
    additionalLinks,
    radioOptions = [],
    orientations,
    spaceBottom = 'none',
    spaceTop = 'large',
  } = options

  if (!enumOptions || Array.isArray(value)) return null
  const getTooltip = (radioValue: string) => {
    return radioOptions.find((option) => option.value === radioValue)?.tooltip
  }

  return (
    <WidgetWrapper
      accordion={accordion}
      additionalLinks={additionalLinks}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
    >
      <RadioGroup
        errorMessage={rawErrors}
        value={value ?? undefined}
        onChange={onChange}
        className={className}
        label={label}
        orientation={orientations === 'row' ? 'horizontal' : 'vertical'}
        required={required}
        disabled={readonly}
      >
        {enumOptions.map((radioElement: EnumOptionsType) => {
          return (
            <Radio
              key={radioElement.value}
              variant={variant}
              value={radioElement.value}
              tooltip={getTooltip(radioElement.value as string)}
            >
              {radioElement.label}
            </Radio>
          )
        })}
      </RadioGroup>
    </WidgetWrapper>
  )
}

export default RadioButtonsWidgetRJSF

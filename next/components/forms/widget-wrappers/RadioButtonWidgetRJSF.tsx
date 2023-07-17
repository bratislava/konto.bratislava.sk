import { EnumOptionsType, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import Radio from '../widget-components/RadioButton/Radio'
import RadioGroup from '../widget-components/RadioButton/RadioGroup'

type RadioUiOptions = {
  value: string
  tooltip: string
}

type RadioButtonRJSFOptions = {
  enumOptions?: EnumOptionsType[]
  className?: string
  radioOptions?: RadioUiOptions[]
  variant?: 'basic' | 'boxed' | 'card'
  orientations?: 'column' | 'row'
} & WidgetOptions

interface RadioButtonFieldWidgetRJSFProps extends WidgetProps {
  options: RadioButtonRJSFOptions
  value: string | null
  onChange: (value?: string | boolean | number | undefined) => void
}

const RadioButtonsWidgetRJSF = ({
  options: {
    enumOptions,
    className,
    variant,
    accordion,
    radioOptions = [],
    orientations,
    spaceBottom = 'none',
    spaceTop = 'large',
  },
  value,
  onChange,
  label,
  rawErrors,
  required,
}: RadioButtonFieldWidgetRJSFProps) => {
  if (!enumOptions || Array.isArray(value)) return null

  const getTooltip = (radioValue: string) => {
    return radioOptions.find((option) => option.value === radioValue)?.tooltip
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <RadioGroup
        value={value ?? undefined}
        errorMessage={rawErrors}
        onChange={onChange}
        className={className}
        label={label}
        orientations={orientations}
        required={required}
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

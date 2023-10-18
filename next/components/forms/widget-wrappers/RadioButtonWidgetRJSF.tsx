import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { RadioButtonUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import Radio from '../widget-components/RadioButton/Radio'
import RadioGroup from '../widget-components/RadioButton/RadioGroup'

type ValueType = string | number | boolean | undefined

interface RadioButtonFieldWidgetRJSFProps extends WidgetProps {
  options: RadioButtonUiOptions & WidgetProps['options']
  value: ValueType
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: ValueType) => void
}

const RadioButtonsWidgetRJSF = ({
  options,
  value,
  onChange,
  label,
  rawErrors,
  required,
  readonly,
}: RadioButtonFieldWidgetRJSFProps) => {
  const { enumOptions, className, variant, radioOptions = [], orientations } = options

  if (!enumOptions) return null

  // RadioGroup doesn't support any other value than string, so we need to map the values to strings.
  // It also doesn't support undefined, so we need to map it to null.
  const valueIndex = value == null ? -1 : enumOptions.findIndex((option) => option.value === value)
  const valueMapped = valueIndex === -1 ? null : `value-${valueIndex}`

  // In the onChange handler we need to map the string value back to the original value.
  const handleChange = (value: string | null) => {
    if (value == null) {
      onChange()
      return
    }

    const match = value.match(/^value-(\d+)$/)

    if (!match) {
      return
    }

    const index = parseInt(match[1], 10)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    onChange(enumOptions[index].value)
  }

  return (
    <WidgetWrapper options={options}>
      <RadioGroup
        errorMessage={rawErrors}
        value={valueMapped}
        onChange={handleChange}
        className={className}
        label={label}
        orientation={orientations === 'row' ? 'horizontal' : 'vertical'}
        required={required}
        disabled={readonly}
      >
        {enumOptions.map((option, radioIndex: number) => {
          const radioValue = `value-${radioIndex}`
          const tooltip = radioOptions.find(
            (innerOption) => innerOption.value === option.value,
          )?.tooltip

          return (
            <Radio key={radioValue} variant={variant} value={radioValue} tooltip={tooltip}>
              {option.label}
            </Radio>
          )
        })}
      </RadioGroup>
    </WidgetWrapper>
  )
}

export default RadioButtonsWidgetRJSF

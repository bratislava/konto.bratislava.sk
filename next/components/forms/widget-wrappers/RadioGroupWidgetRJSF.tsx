import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { RadioGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import Radio from '../widget-components/RadioButton/Radio'
import RadioGroup from '../widget-components/RadioButton/RadioGroup'

type ValueType = string | number | boolean | undefined

interface RadioGroupWidgetRJSFProps extends WidgetProps {
  options: Pick<WidgetProps['options'], 'enumOptions'>
  value: ValueType
  errorMessage?: string
  schema: StrictRJSFSchema & { uiOptions: RadioGroupUiOptions }
  onChange: (value?: ValueType) => void
}

const RadioGroupWidgetRJSF = ({
  id,
  options,
  value,
  onChange,
  label,
  rawErrors,
  required,
  readonly,
  schema,
}: RadioGroupWidgetRJSFProps) => {
  const { enumOptions } = options
  const {
    className,
    variant,
    radioOptions = [],
    orientations,
    size,
    labelSize,
    helptext,
    helptextHeader,
  } = schema.uiOptions

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

  const radioGroupHasDescription = radioOptions.some((option) => option.description)

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
      <RadioGroup
        errorMessage={rawErrors}
        value={valueMapped}
        onChange={handleChange}
        className={className}
        label={label}
        orientation={orientations === 'row' ? 'horizontal' : 'vertical'}
        required={required}
        disabled={readonly}
        size={size}
        labelSize={labelSize}
        helptext={helptext}
        helptextHeader={helptextHeader}
        displayOptionalLabel
      >
        {enumOptions.map((option, radioIndex: number) => {
          const radioValue = `value-${radioIndex}`
          const radioInOptions = radioOptions.find(
            (innerOption) => innerOption.value === option.value,
          )
          const { description } = radioInOptions ?? {}

          return (
            <Radio
              key={radioValue}
              variant={variant}
              value={radioValue}
              description={description}
              radioGroupHasDescription={radioGroupHasDescription}
            >
              {option.label}
            </Radio>
          )
        })}
      </RadioGroup>
    </WidgetWrapper>
  )
}

export default RadioGroupWidgetRJSF

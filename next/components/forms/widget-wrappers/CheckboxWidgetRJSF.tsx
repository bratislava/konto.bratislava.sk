import { EnumOptionsType, StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { CheckboxesUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import Checkbox from '../widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../widget-components/Checkbox/CheckboxGroup'

interface CheckboxesWidgetRJSFProps extends WidgetProps {
  options: CheckboxesUiOptions
  value: string[] | null
  schema: StrictRJSFSchema
  onChange: (value: string[]) => void
}

const CheckboxWidgetRJSF = (props: CheckboxesWidgetRJSFProps) => {
  const {
    options,
    value,
    onChange,
    label,
    schema: { maxItems },
    rawErrors,
    required,
    readonly,
  } = props
  const {
    enumOptions,
    className,
    accordion,
    additionalLinks,
    spaceBottom = 'none',
    spaceTop = 'large',
    checkboxOptions = [],
    variant = 'basic',
  } = options
  if (!enumOptions) return <div />
  const getTooltip = (radioValue: string) => {
    return checkboxOptions.find((option) => option.value === radioValue)?.tooltip
  }
  const isDisabled = (valueName: string) => {
    return value?.length === maxItems && !value?.includes(valueName)
  }
  return (
    <WidgetWrapper
      accordion={accordion}
      additionalLinks={additionalLinks}
      spaceBottom={spaceBottom}
      spaceTop={spaceTop}
    >
      <CheckboxGroup
        errorMessage={rawErrors}
        value={value ?? undefined}
        onChange={onChange}
        className={className}
        label={label}
        required={required}
        disabled={readonly}
      >
        {enumOptions.map((option: EnumOptionsType) => {
          return (
            <Checkbox
              key={option.value}
              value={option.value}
              variant={variant}
              isDisabled={isDisabled(option.value as string) || readonly}
              tooltip={getTooltip(option.value as string)}
            >
              {option.label}
            </Checkbox>
          )
        })}
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF

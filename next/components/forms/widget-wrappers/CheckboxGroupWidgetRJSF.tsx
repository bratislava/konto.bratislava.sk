import { CheckboxGroupUiOptions } from '@forms-shared/generator/uiOptionsTypes'
import { EnumOptionsType, StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import Checkbox from '../widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../widget-components/Checkbox/CheckboxGroup'

interface CheckboxGroupRJSFProps extends WidgetProps {
  options: CheckboxGroupUiOptions & Pick<WidgetProps['options'], 'enumOptions'>
  value: string[] | null
  schema: StrictRJSFSchema
  onChange: (value: string[]) => void
}

const CheckboxGroupWidgetRJSF = ({
  id,
  options,
  value,
  onChange,
  label,
  schema: { maxItems },
  rawErrors,
  required,
  readonly,
}: CheckboxGroupRJSFProps) => {
  const {
    enumOptions,
    className,
    variant = 'basic',
    size,
    labelSize,
    helptext,
    helptextHeader,
  } = options
  if (!enumOptions) return <div />

  const isDisabled = (valueName: string) => {
    return value?.length === maxItems && !value?.includes(valueName)
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <CheckboxGroup
        errorMessage={rawErrors}
        value={value ?? undefined}
        onChange={onChange}
        className={className}
        label={label}
        required={required}
        disabled={readonly}
        size={size}
        labelSize={labelSize}
        helptext={helptext}
        helptextHeader={helptextHeader}
        displayOptionalLabel
      >
        {enumOptions.map((option: EnumOptionsType) => {
          return (
            <Checkbox
              key={option.value}
              value={option.value}
              variant={variant}
              isDisabled={isDisabled(option.value as string) || readonly}
            >
              {option.label}
            </Checkbox>
          )
        })}
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxGroupWidgetRJSF

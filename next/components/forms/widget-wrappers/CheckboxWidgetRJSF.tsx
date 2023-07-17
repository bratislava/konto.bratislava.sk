import { EnumOptionsType, WidgetProps } from '@rjsf/utils'
import { WidgetOptions } from 'components/forms/types/WidgetOptions'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'

import Checkbox from '../widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../widget-components/Checkbox/CheckboxGroup'

type CheckboxUiOptions = {
  value: string
  tooltip: string
}

type CheckboxesRJSFOptions = {
  enumOptions?: EnumOptionsType[]
  variant?: 'basic' | 'boxed'
  checkboxOptions?: CheckboxUiOptions[]
} & WidgetOptions

interface CheckboxesWidgetRJSFProps extends WidgetProps {
  options: CheckboxesRJSFOptions
  value: string[] | null
  onChange: (value: string[]) => void
}

const CheckboxWidgetRJSF = ({
  options: {
    enumOptions,
    className,
    accordion,
    spaceBottom = 'none',
    spaceTop = 'large',
    checkboxOptions = [],
    variant = 'basic',
  },
  value,
  onChange,
  label,
  schema: { maxItems },
  rawErrors,
  required,
}: CheckboxesWidgetRJSFProps) => {
  if (!enumOptions) {
    return null
  }

  const getTooltip = (radioValue: string) => {
    return checkboxOptions.find((option) => option.value === radioValue)?.tooltip
  }

  const isDisabled = (valueName: string) => {
    return value?.length === maxItems && !value?.includes(valueName)
  }

  return (
    <WidgetWrapper accordion={accordion} spaceBottom={spaceBottom} spaceTop={spaceTop}>
      <CheckboxGroup
        rawErrors={rawErrors}
        value={value ?? undefined}
        onChange={onChange}
        className={className}
        label={label}
        required={required}
      >
        {enumOptions.map((option: EnumOptionsType) => {
          return (
            <Checkbox
              key={option.value}
              value={option.value}
              variant={variant}
              isDisabled={isDisabled(option.value as string)}
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

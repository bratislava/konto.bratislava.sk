import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import React from 'react'
import { CheckboxUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import Checkbox from '../widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../widget-components/Checkbox/CheckboxGroup'

interface CheckboxRJSFProps extends WidgetProps {
  options: CheckboxUiOptions & WidgetProps['options']
  value: boolean | null
  schema: StrictRJSFSchema
  onChange: (value: boolean) => void
}

const CheckboxWidgetRJSF = ({
  options,
  value,
  onChange,
  label,
  rawErrors,
  required,
  readonly,
}: CheckboxRJSFProps) => {
  const {
    className,
    variant = 'basic',
    size,
    labelSize,
    helptext,
    helptextHeader,
    checkboxLabel,
  } = options

  const checkboxGroupValue = value ? ['true'] : []
  const checkboxGroupOnChange = (value: string[]) => {
    onChange(value.includes('true'))
  }

  return (
    <WidgetWrapper options={options}>
      {/* TODO: Refactor SingleCheckBox to have field properties and use it.  */}
      <CheckboxGroup
        errorMessage={rawErrors}
        value={checkboxGroupValue ?? undefined}
        onChange={checkboxGroupOnChange}
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
        <Checkbox value="true" variant={variant} isDisabled={readonly}>
          {checkboxLabel}
        </Checkbox>
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF

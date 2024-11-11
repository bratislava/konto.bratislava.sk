import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import Checkbox from '../widget-components/Checkbox/Checkbox'
import CheckboxGroup from '../widget-components/Checkbox/CheckboxGroup'

interface CheckboxRJSFProps extends WidgetProps {
  options: CheckboxUiOptions
  value: boolean | null
  schema: StrictRJSFSchema & { uiOptions: CheckboxUiOptions }
  onChange: (value: boolean) => void
}

const CheckboxWidgetRJSF = ({
  id,
  value,
  onChange,
  label,
  rawErrors,
  required,
  readonly,
  schema,
}: CheckboxRJSFProps) => {
  const {
    className,
    variant = 'basic',
    size,
    labelSize,
    helptext,
    helptextHeader,
    checkboxLabel,
  } = schema.uiOptions

  const checkboxGroupValue = value ? ['true'] : []
  const checkboxGroupOnChange = (value: string[]) => {
    onChange(value.includes('true'))
  }

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
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

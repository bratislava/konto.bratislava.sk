import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React from 'react'

import CheckboxGroup from '@/src/components/widget-components/Checkbox/CheckboxGroup'
import CheckboxGroupItem from '@/src/components/widget-components/Checkbox/CheckboxGroupItem'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface CheckboxRJSFProps extends WidgetProps {
  options: CheckboxUiOptions
  value: boolean | null
  schema: StrictRJSFSchema
  onChange: (value: boolean) => void
}

const CheckboxWidgetRJSF = ({
  id,
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
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    checkboxLabel,
  } = options

  const checkboxGroupValue = value ? ['true'] : []
  const checkboxGroupOnChange = (value: string[]) => {
    onChange(value.includes('true'))
  }

  return (
    <WidgetWrapper id={id} options={options}>
      {/* TODO: Refactor SingleCheckBox to have field properties and use it.  */}
      <CheckboxGroup
        errorMessage={rawErrors}
        value={checkboxGroupValue ?? undefined}
        onChange={checkboxGroupOnChange}
        className={className}
        label={label}
        isRequired={required}
        isDisabled={readonly}
        size={size}
        labelSize={labelSize}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        displayOptionalLabel
      >
        <CheckboxGroupItem value="true" variant={variant} isDisabled={readonly}>
          {checkboxLabel}
        </CheckboxGroupItem>
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF

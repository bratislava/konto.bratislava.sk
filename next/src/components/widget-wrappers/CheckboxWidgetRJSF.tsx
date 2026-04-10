import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { CheckboxUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ReactNode } from 'react'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import { mapRjsfToFieldProps } from '@/src/components/fields/mapRjsfToFieldProps'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface CheckboxRJSFProps extends WidgetProps {
  options: CheckboxUiOptions
  value: boolean | null
  schema: StrictRJSFSchema
  onChange: (value: boolean) => void
}

const renderMarkdown = (text: string): ReactNode => <FormMarkdown>{text}</FormMarkdown>

const CheckboxWidgetRJSF = ({
  id,
  options,
  value,
  onChange,
  label,
  rawErrors,
  required,
  disabled,
  readonly,
}: CheckboxRJSFProps) => {
  const {
    className,
    variant = 'basic',
    labelSize,
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    checkboxLabel,
  } = options

  const fieldProps = mapRjsfToFieldProps(
    { label, required: !!required, disabled: !!disabled, readonly: !!readonly, rawErrors },
    { helptext, helptextMarkdown, helptextFooter, helptextFooterMarkdown, labelSize },
    renderMarkdown,
  )

  const checkboxGroupValue = value ? ['true'] : []
  const checkboxGroupOnChange = (newValue: string[]) => {
    onChange(newValue.includes('true'))
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <CheckboxGroup
        {...fieldProps}
        value={checkboxGroupValue}
        onChange={checkboxGroupOnChange}
        className={className}
      >
        <Checkbox value="true" variant={variant}>
          {checkboxLabel}
        </Checkbox>
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxWidgetRJSF

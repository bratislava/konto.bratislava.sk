import { WidgetProps } from '@rjsf/utils'
import { InputUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ReactNode } from 'react'

import { mapRjsfToFieldProps } from '@/src/components/fields/mapRjsfToFieldProps'
import TextField from '@/src/components/fields/TextField'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface InputWidgetRJSFProps extends WidgetProps {
  options: InputUiOptions
  value: string | undefined
  onChange: (value?: string) => void
}

const renderMarkdown = (text: string): ReactNode => <FormMarkdown>{text}</FormMarkdown>

const InputWidgetRJSF = ({
  id,
  label,
  options,
  placeholder,
  required,
  value,
  disabled,
  onChange,
  rawErrors,
  readonly,
  name,
}: InputWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    inputType,
    labelSize,
  } = options

  const fieldProps = mapRjsfToFieldProps(
    { label, required: !!required, disabled: !!disabled, readonly: !!readonly, rawErrors },
    { helptext, helptextMarkdown, helptextFooter, helptextFooterMarkdown, labelSize },
    renderMarkdown,
  )

  return (
    <WidgetWrapper id={id} options={options}>
      <TextField
        {...fieldProps}
        name={name}
        type={inputType}
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={(newValue) => onChange(newValue || undefined)}
      />
    </WidgetWrapper>
  )
}

export default InputWidgetRJSF

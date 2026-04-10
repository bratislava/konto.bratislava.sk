import { WidgetProps } from '@rjsf/utils'
import { TextAreaUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ReactNode } from 'react'

import { mapRjsfToFieldProps } from '@/src/components/fields/mapRjsfToFieldProps'
import TextAreaField from '@/src/components/fields/TextAreaField'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import FieldBlurWrapper from '@/src/components/widget-components/FieldBlurWrapper/FieldBlurWrapper'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface TextAreaWidgetRJSFProps extends WidgetProps {
  value: string | undefined
  options: TextAreaUiOptions
  onChange: (value?: string) => void
}

const renderMarkdown = (text: string): ReactNode => <FormMarkdown>{text}</FormMarkdown>

const TextAreaWidgetRJSF = ({
  id,
  value,
  label,
  placeholder,
  rawErrors,
  required,
  disabled,
  options,
  onChange,
  readonly,
}: TextAreaWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    labelSize,
  } = options

  const fieldProps = mapRjsfToFieldProps(
    { label, required: !!required, disabled: !!disabled, readonly: !!readonly, rawErrors },
    { helptext, helptextMarkdown, helptextFooter, helptextFooterMarkdown, labelSize },
    renderMarkdown,
  )

  const handleOnChange = (newValue: string) => {
    if (!newValue) onChange(undefined)
    else onChange(newValue)
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <FieldBlurWrapper value={value ?? ''} onChange={handleOnChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange, onBlur }) => (
          <TextAreaField
            {...fieldProps}
            value={wrapperValue}
            placeholder={placeholder}
            className={className}
            onChange={wrapperOnChange}
            onBlur={onBlur}
          />
        )}
      </FieldBlurWrapper>
    </WidgetWrapper>
  )
}

export default TextAreaWidgetRJSF

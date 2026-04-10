import { WidgetProps } from '@rjsf/utils'
import { NumberUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ReactNode } from 'react'

import { mapRjsfToFieldProps } from '@/src/components/fields/mapRjsfToFieldProps'
import NumberField from '@/src/components/fields/NumberField'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface NumberWidgetRJSFProps extends WidgetProps {
  options: NumberUiOptions
  value: number | undefined
  onChange: (value?: number) => void
}

const renderMarkdown = (text: string): ReactNode => <FormMarkdown>{text}</FormMarkdown>

const NumberWidgetRJSF = ({
  id,
  schema,
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
}: NumberWidgetRJSFProps) => {
  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    labelSize,
  } = options

  const getStep = () => {
    if (schema.multipleOf != null) {
      return schema.multipleOf
    }
    if (schema.type === 'integer') {
      return 1
    }

    return undefined
  }

  const getFormatOptions = () => {
    if (schema.type === 'integer' && !options.formatOptions?.maximumFractionDigits) {
      return { ...options.formatOptions, maximumFractionDigits: 0 }
    }

    return options.formatOptions
  }

  const fieldProps = mapRjsfToFieldProps(
    { label, required: !!required, disabled: !!disabled, readonly: !!readonly, rawErrors },
    { helptext, helptextMarkdown, helptextFooter, helptextFooterMarkdown, labelSize },
    renderMarkdown,
  )

  return (
    <WidgetWrapper id={id} options={options}>
      <NumberField
        {...fieldProps}
        name={name}
        placeholder={placeholder}
        value={value}
        className={className}
        onChange={(newValue) => onChange(Number.isNaN(newValue) ? undefined : newValue)}
        minValue={schema.minimum}
        maxValue={schema.maximum}
        formatOptions={getFormatOptions()}
        step={getStep()}
      />
    </WidgetWrapper>
  )
}

export default NumberWidgetRJSF

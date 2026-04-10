import { ReactNode } from 'react'

import { FieldBaseProps, LabelSize } from './_shared/types'

interface RjsfWidgetProps {
  label: string
  required: boolean
  disabled: boolean
  readonly: boolean
  rawErrors?: string[]
}

interface RjsfFieldOptions {
  helptext?: string
  helptextMarkdown?: boolean
  helptextFooter?: string
  helptextFooterMarkdown?: boolean
  labelSize?: LabelSize
}

export const mapRjsfToFieldProps = (
  widgetProps: RjsfWidgetProps,
  options: RjsfFieldOptions,
  renderMarkdown: (text: string) => ReactNode,
): FieldBaseProps & { isRequired: boolean; isDisabled: boolean; isReadOnly: boolean } => {
  const rawErrors = widgetProps.rawErrors?.filter(Boolean)

  return {
    label: widgetProps.label,
    isRequired: widgetProps.required,
    isDisabled: widgetProps.disabled,
    isReadOnly: widgetProps.readonly,
    displayOptionalLabel: true,
    labelSize: options.labelSize,
    helptext:
      options.helptextMarkdown && options.helptext
        ? renderMarkdown(options.helptext)
        : options.helptext,
    helptextFooter:
      options.helptextFooterMarkdown && options.helptextFooter
        ? renderMarkdown(options.helptextFooter)
        : options.helptextFooter,
    errorMessage: rawErrors?.length ? rawErrors.join(', ') : undefined,
  }
}

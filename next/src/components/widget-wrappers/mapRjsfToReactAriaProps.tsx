import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WidgetUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { FieldBaseProps } from '@/src/components/fields/_shared/types'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import { getFieldSizeClassName } from '@/src/components/widget-wrappers/getFieldSizeClassName'
import cn from '@/src/utils/cn'

type AdapterConfig<TValue, TFieldValue> = {
  toFieldValue: (rjsfValue: TValue) => TFieldValue
  fromFieldValue: (fieldValue: TFieldValue) => TValue
}

type AdapterFieldProps<TFieldValue> = FieldBaseProps & {
  value: TFieldValue
  onChange: (value: TFieldValue) => void
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  name: string
  className?: string
}

type AdapterResult<TFieldValue, TOptions extends WidgetUiOptions> = {
  wrapperProps: { id: string; options: WidgetUiOptions }
  fieldProps: AdapterFieldProps<TFieldValue>
  specificOptions: Omit<TOptions, keyof WidgetUiOptions>
}

export type RJSFWidgetProps<TValue, TOptions extends WidgetUiOptions> = Omit<
  WidgetProps<TValue>,
  'options' | 'value' | 'schema' | 'onChange'
> & {
  options: TOptions
  value: TValue
  schema: StrictRJSFSchema
  onChange: (value: TValue) => void
}

const mapRjsfToReactAriaProps = <TValue, TFieldValue, TOptions extends WidgetUiOptions>(
  props: RJSFWidgetProps<TValue, TOptions>,
  config: AdapterConfig<TValue, TFieldValue>,
): AdapterResult<TFieldValue, TOptions> => {
  const options = props.options
  const rawErrors = props.rawErrors?.filter(Boolean)

  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    labelSize,
    size,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    selfColumn,
    spaceTop,
    spaceBottom,
    belowComponents,
    rightComponents,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...specificOptions
  } = options

  return {
    wrapperProps: {
      id: props.id,
      options,
    },
    fieldProps: {
      label: props.label,
      isRequired: !!props.required,
      isDisabled: !!props.disabled,
      isReadOnly: !!props.readonly,
      displayOptionalLabel: true,
      labelSize,
      helptext: helptextMarkdown && helptext ? <FormMarkdown>{helptext}</FormMarkdown> : helptext,
      helptextFooter:
        helptextFooterMarkdown && helptextFooter ? (
          <FormMarkdown>{helptextFooter}</FormMarkdown>
        ) : (
          helptextFooter
        ),
      errorMessage: rawErrors?.length ? rawErrors.join(', ') : undefined,
      value: config.toFieldValue(props.value),
      onChange: (valueInner) => props.onChange(config.fromFieldValue(valueInner)),
      name: props.name,
      className: cn(getFieldSizeClassName(size), className),
    },
    specificOptions,
  }
}

export default mapRjsfToReactAriaProps

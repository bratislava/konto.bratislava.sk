import { WidgetProps } from '@rjsf/utils'
import { WidgetUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { FieldBaseProps } from '@/src/components/fields/_shared/types'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'

type AdapterConfig<TValue> = {
  toField: (rjsfValue: any) => TValue
  fromField: (fieldValue: TValue) => any
}

type AdapterFieldProps<TValue> = FieldBaseProps & {
  value: TValue
  onChange: (value: TValue) => void
  isRequired: boolean
  isDisabled: boolean
  isReadOnly: boolean
  name: string
  className?: string
}

type AdapterResult<TValue, TOptions extends WidgetUiOptions> = {
  wrapperProps: { id: string; options: WidgetUiOptions }
  fieldProps: AdapterFieldProps<TValue>
  specificOptions: Omit<TOptions, keyof WidgetUiOptions>
}

const useRjsfAdapter = <TValue, TOptions extends WidgetUiOptions = WidgetUiOptions>(
  props: WidgetProps,
  config: AdapterConfig<TValue>,
): AdapterResult<TValue, TOptions> => {
  const options = props.options as TOptions
  const rawErrors = props.rawErrors?.filter(Boolean)

  const {
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    className,
    labelSize,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    size,
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
      options: options as WidgetUiOptions,
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
      value: config.toField(props.value),
      onChange: (val: TValue) => props.onChange(config.fromField(val)),
      name: props.name,
      className,
    },
    specificOptions: specificOptions as Omit<TOptions, keyof WidgetUiOptions>,
  }
}

export default useRjsfAdapter

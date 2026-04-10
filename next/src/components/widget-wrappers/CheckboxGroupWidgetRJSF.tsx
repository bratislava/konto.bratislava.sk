import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { CheckboxGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ReactNode, useMemo } from 'react'

import Checkbox from '@/src/components/fields/Checkbox'
import CheckboxGroup from '@/src/components/fields/CheckboxGroup'
import { mapRjsfToFieldProps } from '@/src/components/fields/mapRjsfToFieldProps'
import FormMarkdown from '@/src/components/formatting/FormMarkdown/FormMarkdown'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface CheckboxGroupRJSFProps extends WidgetProps {
  options: WithEnumOptions<CheckboxGroupUiOptions>
  value: string[] | null
  schema: StrictRJSFSchema
  onChange: (value: string[]) => void
}

const renderMarkdown = (text: string): ReactNode => <FormMarkdown>{text}</FormMarkdown>

const CheckboxGroupWidgetRJSF = ({
  id,
  options,
  value,
  onChange,
  label,
  schema: { maxItems },
  rawErrors,
  required,
  disabled,
  readonly,
}: CheckboxGroupRJSFProps) => {
  const {
    enumOptions,
    enumMetadata,
    className,
    variant = 'basic',
    labelSize,
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
  } = options

  const fieldProps = mapRjsfToFieldProps(
    { label, required: !!required, disabled: !!disabled, readonly: !!readonly, rawErrors },
    { helptext, helptextMarkdown, helptextFooter, helptextFooterMarkdown, labelSize },
    renderMarkdown,
  )

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )

  const isDisabled = (valueName: string) => {
    return maxItems != null && value?.length === maxItems && !value?.includes(valueName)
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <CheckboxGroup
        {...fieldProps}
        value={value ?? undefined}
        onChange={onChange}
        className={className}
      >
        {mergedOptions.map((option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            variant={variant}
            isDisabled={isDisabled(option.value)}
          >
            {option.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxGroupWidgetRJSF

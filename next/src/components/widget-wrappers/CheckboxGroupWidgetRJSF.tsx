import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { CheckboxGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React, { useMemo } from 'react'

import CheckboxGroup from '@/src/components/widget-components/Checkbox/CheckboxGroup'
import CheckboxGroupItem from '@/src/components/widget-components/Checkbox/CheckboxGroupItem'
import WidgetWrapper from '@/src/components/widget-wrappers/WidgetWrapper'

interface CheckboxGroupRJSFProps extends WidgetProps {
  options: WithEnumOptions<CheckboxGroupUiOptions>
  value: string[] | null
  schema: StrictRJSFSchema
  onChange: (value: string[]) => void
}

const CheckboxGroupWidgetRJSF = ({
  id,
  options,
  value,
  onChange,
  label,
  schema: { maxItems },
  rawErrors,
  required,
  readonly,
}: CheckboxGroupRJSFProps) => {
  const {
    enumOptions,
    enumMetadata,
    className,
    variant = 'basic',
    size,
    labelSize,
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
  } = options

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )

  const isDisabled = (valueName: string) => {
    return value?.length === maxItems && !value?.includes(valueName)
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <CheckboxGroup
        errorMessage={rawErrors}
        value={value ?? undefined}
        onChange={onChange}
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
        {mergedOptions.map((option) => {
          return (
            <CheckboxGroupItem
              key={option.value}
              value={option.value}
              variant={variant}
              isDisabled={isDisabled(option.value) || readonly}
            >
              {option.label}
            </CheckboxGroupItem>
          )
        })}
      </CheckboxGroup>
    </WidgetWrapper>
  )
}

export default CheckboxGroupWidgetRJSF

import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { RadioGroupUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import React, { ReactNode, useMemo } from 'react'

import Radio from '../widget-components/RadioButton/Radio'
import RadioGroup from '../widget-components/RadioButton/RadioGroup'

type ValueType = string | boolean | undefined

interface RadioGroupWidgetRJSFProps extends WidgetProps {
  options: WithEnumOptions<RadioGroupUiOptions>
  value: ValueType
  errorMessage?: string
  schema: StrictRJSFSchema
  onChange: (value?: ValueType) => void
}

interface ValueAdapterProps {
  schema: StrictRJSFSchema
  value: ValueType
  onChange: (value: ValueType) => void
  children: (props: { value: string | null; onChange: (value: string | null) => void }) => ReactNode
}

/**
 * RadioGroup component only supports string as value, in RJSF we want to support both string and boolean.
 * Therefore, if the value is boolean, we need to convert it to string before passing it to the RadioGroup component.
 * It also handles conversion between null (RadioGroup) and undefined (RJSF).
 */
const ValueAdapter = ({ schema, value, onChange, children }: ValueAdapterProps) => {
  if (schema.type === 'boolean') {
    const mappedValue = typeof value === 'boolean' ? value.toString() : null
    const handleChange = (newValue: string | null) => {
      if (newValue === null) {
        // eslint-disable-next-line unicorn/no-useless-undefined
        onChange(undefined)
        return
      }
      if (newValue === 'true') {
        onChange(true)
        return
      }
      if (newValue === 'false') {
        onChange(false)
        return
      }
      // eslint-disable-next-line unicorn/no-useless-undefined
      onChange(undefined)
    }

    return <>{children({ value: mappedValue, onChange: handleChange })}</>
  }
  if (schema.type === 'string') {
    const mappedValue = value === undefined ? null : (value as string)
    const handleChange = (newValue: string | null) => {
      if (newValue === null) {
        // eslint-disable-next-line unicorn/no-useless-undefined
        onChange(undefined)
        return
      }
      onChange(newValue)
    }

    return <>{children({ value: mappedValue, onChange: handleChange })}</>
  }

  return null
}

const RadioGroupWidgetRJSF = ({
  id,
  schema,
  options,
  value,
  onChange,
  label,
  rawErrors,
  required,
  readonly,
}: RadioGroupWidgetRJSFProps) => {
  const {
    enumOptions,
    enumMetadata,
    className,
    variant,
    orientations,
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

  const radioGroupHasDescription = mergedOptions.some((option) => option.description)

  return (
    <WidgetWrapper id={id} options={options}>
      <ValueAdapter schema={schema} value={value} onChange={onChange}>
        {({ value: wrapperValue, onChange: wrapperOnChange }) => (
          <RadioGroup
            errorMessage={rawErrors}
            value={wrapperValue}
            onChange={wrapperOnChange}
            className={className}
            label={label}
            orientation={orientations === 'row' ? 'horizontal' : 'vertical'}
            required={required}
            disabled={readonly}
            size={size}
            labelSize={labelSize}
            helptext={helptext}
            helptextMarkdown={helptextMarkdown}
            helptextFooter={helptextFooter}
            helptextFooterMarkdown={helptextFooterMarkdown}
            displayOptionalLabel
          >
            {mergedOptions.map((option) => {
              const radioValue =
                typeof option.value === 'boolean' ? option.value.toString() : option.value

              return (
                <Radio
                  key={radioValue}
                  variant={variant}
                  value={radioValue}
                  description={option.description}
                  radioGroupHasDescription={radioGroupHasDescription}
                >
                  {option.label}
                </Radio>
              )
            })}
          </RadioGroup>
        )}
      </ValueAdapter>
    </WidgetWrapper>
  )
}

export default RadioGroupWidgetRJSF

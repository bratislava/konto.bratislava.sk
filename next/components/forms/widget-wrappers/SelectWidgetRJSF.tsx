import { WidgetProps } from '@rjsf/utils'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { useMemo } from 'react'

import WidgetWrapper from '@/components/forms/widget-wrappers/WidgetWrapper'

import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'

interface SelectWidgetRJSFProps extends WidgetProps {
  options: WithEnumOptions<SelectUiOptions>
  value: string | undefined
  onChange: (value?: string | undefined) => void
}

const SelectWidgetRJSF = ({
  id,
  label,
  options,
  value,
  required,
  disabled,
  placeholder,
  onChange,
  rawErrors,
  readonly,
}: SelectWidgetRJSFProps) => {
  const {
    enumOptions,
    enumMetadata,
    helptext,
    helptextMarkdown,
    helptextFooter,
    helptextFooterMarkdown,
    tooltip,
    className,
    size,
    labelSize,
  } = options

  const mergedOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )
  const selectValue = mergedOptions.find((option) => option.value === value)

  const handleChange = (newValue: SelectOption | null) =>
    onChange(newValue ? newValue.value : undefined)

  return (
    <WidgetWrapper id={id} options={options}>
      <SelectField
        isMulti={false}
        label={label}
        helptext={helptext}
        helptextMarkdown={helptextMarkdown}
        helptextFooter={helptextFooter}
        helptextFooterMarkdown={helptextFooterMarkdown}
        tooltip={tooltip}
        errorMessage={rawErrors}
        required={required}
        isDisabled={disabled || readonly}
        className={className}
        size={size}
        labelSize={labelSize}
        options={mergedOptions}
        placeholder={placeholder}
        displayOptionalLabel
        value={selectValue}
        onChange={handleChange}
      />
    </WidgetWrapper>
  )
}

export default SelectWidgetRJSF

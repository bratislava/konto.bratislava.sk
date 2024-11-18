import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { WithEnumOptions } from 'forms-shared/form-utils/WithEnumOptions'
import { mergeEnumOptionsMetadata } from 'forms-shared/generator/optionItems'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { useMemo } from 'react'

import { isDefined } from '../../../frontend/utils/general'
import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'

interface SelectMultipleWidgetRJSFProps extends WidgetProps {
  options: WithEnumOptions<SelectUiOptions>
  value: string[] | undefined
  onChange: (value?: string[] | undefined) => void
}

const SelectMultipleWidgetRJSF = ({
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
}: SelectMultipleWidgetRJSFProps) => {
  const {
    enumOptions,
    enumMetadata,
    helptext,
    helptextFooter,
    tooltip,
    className,
    size,
    labelSize,
  } = options

  const selectOptions = useMemo(
    () => mergeEnumOptionsMetadata(enumOptions, enumMetadata),
    [enumOptions, enumMetadata],
  )
  const selectValue = useMemo(() => {
    if (!value) {
      return []
    }

    return value
      .map((value) => selectOptions.find((option) => option.value === value))
      .filter(isDefined)
  }, [value, selectOptions])

  const handleChange = (newValue: readonly SelectOption[]) =>
    onChange(newValue.map((option) => option.value).filter(isDefined))

  return (
    <WidgetWrapper id={id} options={options}>
      <SelectField
        isMulti
        label={label}
        helptext={helptext}
        helptextFooter={helptextFooter}
        tooltip={tooltip}
        errorMessage={rawErrors}
        required={required}
        isDisabled={disabled || readonly}
        className={className}
        size={size}
        labelSize={labelSize}
        options={selectOptions}
        placeholder={placeholder}
        displayOptionalLabel
        value={selectValue}
        onChange={handleChange}
      />
    </WidgetWrapper>
  )
}

export default SelectMultipleWidgetRJSF

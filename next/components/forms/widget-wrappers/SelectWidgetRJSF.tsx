import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'
import { createSelectOptionsFromEnumOptions } from './createSelectOptionsFromEnumOptions'

interface SelectWidgetRJSFProps extends WidgetProps {
  options: SelectUiOptions & Pick<WidgetProps['options'], 'enumOptions'>
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
    helptext,
    helptextHeader,
    tooltip,
    className,
    size,
    labelSize,
    selectOptions,
  } = options

  const componentOptions = createSelectOptionsFromEnumOptions(enumOptions, selectOptions)

  const selectValue = componentOptions.find((option) => option.value === value)

  const handleChange = (newValue: SelectOption | null) =>
    onChange(newValue ? newValue.value : undefined)

  return (
    <WidgetWrapper id={id} options={options}>
      <SelectField
        isMulti={false}
        label={label}
        helptext={helptext}
        helptextHeader={helptextHeader}
        tooltip={tooltip}
        errorMessage={rawErrors}
        required={required}
        isDisabled={disabled || readonly}
        className={className}
        size={size}
        labelSize={labelSize}
        options={componentOptions}
        placeholder={placeholder}
        displayOptionalLabel
        value={selectValue}
        onChange={handleChange}
      />
    </WidgetWrapper>
  )
}

export default SelectWidgetRJSF

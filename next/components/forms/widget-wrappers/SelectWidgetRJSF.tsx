import { StrictRJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'
import { createSelectOptionsFromEnumOptions } from './createSelectOptionsFromEnumOptions'

interface SelectWidgetRJSFProps extends WidgetProps {
  schema: StrictRJSFSchema & { uiOptions: SelectUiOptions }
  options: Pick<WidgetProps['options'], 'enumOptions'>
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
  schema,
}: SelectWidgetRJSFProps) => {
  const { enumOptions } = options
  const { helptext, helptextHeader, tooltip, className, size, labelSize, selectOptions } =
    schema.uiOptions

  const componentOptions = createSelectOptionsFromEnumOptions(enumOptions, selectOptions)

  const selectValue = componentOptions.find((option) => option.value === value)

  const handleChange = (newValue: SelectOption | null) =>
    onChange(newValue ? newValue.value : undefined)

  return (
    <WidgetWrapper id={id} options={schema.uiOptions}>
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

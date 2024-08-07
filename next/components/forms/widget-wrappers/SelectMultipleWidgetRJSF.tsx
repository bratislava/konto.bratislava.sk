import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'

import { isDefined } from '../../../frontend/utils/general'
import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'
import { createSelectOptionsFromEnumOptions } from './createSelectOptionsFromEnumOptions'

interface SelectMultipleWidgetRJSFProps extends WidgetProps {
  options: SelectUiOptions & Pick<WidgetProps['options'], 'enumOptions'>
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
    helptext,
    helptextHeader,
    tooltip,
    className,
    size,
    labelSize,
    selectOptions,
  } = options

  const componentOptions = createSelectOptionsFromEnumOptions(enumOptions, selectOptions)

  const selectValue =
    value
      ?.map((value) => componentOptions.find((option) => option.value === value))
      .filter(isDefined) ?? []

  const handleChange = (newValue: readonly SelectOption[]) =>
    onChange(newValue.map((option) => option.value).filter(isDefined))

  return (
    <WidgetWrapper id={id} options={options}>
      <SelectField
        isMulti
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

export default SelectMultipleWidgetRJSF

import { RJSFSchema, WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { SelectFieldUiOptions } from 'schema-generator/generator/uiOptionsTypes'

import useEnum from '../../../frontend/hooks/useEnum'
import SelectField from '../widget-components/SelectField/SelectField'
import { SelectOption } from '../widget-components/SelectField/SelectOption.interface'

interface RJSFSelectSchema extends RJSFSchema {
  ciselnik?: {
    id: string
  }
}

interface SelectFieldWidgetRJSFProps<T = unknown> extends WidgetProps {
  options: SelectFieldUiOptions & WidgetProps['options']
  value: T | T[] | null
  schema: RJSFSelectSchema
  onChange: (value?: T | T[] | null) => void
}

const SelectFieldWidgetRJSF = ({
  label,
  options,
  value,
  required,
  disabled,
  placeholder,
  schema,
  onChange,
  rawErrors,
  readonly,
}: SelectFieldWidgetRJSFProps) => {
  const {
    enumOptions,
    selectAllOption,
    helptext,
    tooltip,
    dropdownDivider,
    className,
    explicitOptional,
    hideScrollbar = false,
    maxWordSize,
  } = options

  const type = schema.type === 'array' ? 'multiple' : 'one'

  const handleOnChangeMultiple = (newValue?: SelectOption[]) => {
    if (newValue) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const optionValues = newValue.map((option: SelectOption) => option.const)
      onChange(optionValues)
    } else {
      onChange()
    }
  }

  const handleOnChangeOne = (newValue?: SelectOption[]) => {
    if (newValue && newValue[0]) {
      onChange(newValue[0].const)
    } else {
      onChange()
    }
  }

  const { data } = useEnum(schema.ciselnik?.id)
  const transformedEnumOptions = enumOptions
    ? enumOptions.map((option) => option.schema as SelectOption)
    : data

  const handleOnChange = (newValue?: SelectOption[]) => {
    const originalNewValue = transformedEnumOptions?.filter((option: SelectOption) => {
      return newValue?.some((value) => {
        return (
          option.title === value.title &&
          option.description === value.description &&
          option.const === value.const
        )
      })
    })

    if (type === 'multiple') {
      handleOnChangeMultiple(originalNewValue)
    } else {
      handleOnChangeOne(originalNewValue)
    }
  }

  const handleTransformOne = (): SelectOption[] => {
    const transformedValue: SelectOption[] = []
    if (!value || Array.isArray(value)) return transformedValue

    const chosenOption = transformedEnumOptions?.find((option) => value === option.const)
    return chosenOption ? [chosenOption] : []
  }

  const handleTransformMultiple = (): SelectOption[] => {
    const transformedValue: SelectOption[] = []
    if (!value || !Array.isArray(value)) return transformedValue

    value.forEach((optionValue) => {
      transformedEnumOptions?.forEach((option) => {
        if (option.const === optionValue) {
          transformedValue.push(option)
        }
      })
    })

    return transformedValue
  }

  const transformedValue = type === 'multiple' ? handleTransformMultiple() : handleTransformOne()

  return (
    <WidgetWrapper options={options}>
      <SelectField
        type={type}
        label={label}
        enumOptions={transformedEnumOptions}
        value={transformedValue}
        selectAllOption={selectAllOption}
        placeholder={placeholder}
        helptext={helptext}
        tooltip={tooltip}
        dropdownDivider={dropdownDivider}
        errorMessage={rawErrors}
        required={required}
        disabled={disabled || readonly}
        className={className}
        onChange={handleOnChange}
        explicitOptional={explicitOptional}
        hideScrollbar={hideScrollbar}
        alwaysOneSelected={false}
        maxWordSize={maxWordSize}
      />
    </WidgetWrapper>
  )
}

export default SelectFieldWidgetRJSF

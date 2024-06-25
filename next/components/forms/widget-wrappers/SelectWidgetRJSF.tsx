import { WidgetProps } from '@rjsf/utils'
import WidgetWrapper from 'components/forms/widget-wrappers/WidgetWrapper'
import { SelectUiOptions } from 'forms-shared/generator/uiOptionsTypes'
import { ComponentProps } from 'react'

import { isDefined } from '../../../frontend/utils/general'
import SelectField, { SelectOption } from '../widget-components/SelectField/SelectField'

type SingleMultiSelectBaseProps = Omit<
  ComponentProps<typeof SelectField>,
  'options' | 'value' | 'onChange' | 'isMulti'
> & { options: SelectOption[] }

const SingleSelect = ({
  value,
  onChange,
  ...rest
}: SingleMultiSelectBaseProps & {
  value: string | undefined
  onChange: (value: string | undefined) => void
}) => {
  const selectValue = rest.options.find((option) => option.value === value)
  const selectOnChange = (newValue: SelectOption | null) =>
    onChange(newValue ? newValue.value : undefined)

  return <SelectField isMulti={false} value={selectValue} onChange={selectOnChange} {...rest} />
}

const MultiSelect = ({
  value,
  onChange,
  ...rest
}: SingleMultiSelectBaseProps & {
  value: string[] | undefined
  onChange: (value: string[] | undefined) => void
}) => {
  const selectValue =
    value
      ?.map((value) => rest.options.find((option) => option.value === value))
      .filter(isDefined) ?? []
  const selectOnChange = (newValue: readonly SelectOption[]) =>
    onChange(newValue.map((option) => option.value).filter(isDefined))

  return <SelectField isMulti value={selectValue} onChange={selectOnChange} {...rest} />
}

interface SelectWidgetRJSFProps extends WidgetProps {
  options: SelectUiOptions & Pick<WidgetProps['options'], 'enumOptions'>
  value: string | string[] | undefined
  onChange: (value?: string | string[] | undefined) => void
}

const SelectWidgetRJSF = ({
  id,
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

  const isMulti = schema.type === 'array'

  const componentOptions: SelectOption[] = enumOptions
    ? enumOptions.map((option) => {
        const selectOption = selectOptions?.[option.value as string]

        return {
          label: selectOption?.title ?? '',
          value: option.value,
          description: selectOption?.description,
        }
      })
    : []

  const componentProps: SingleMultiSelectBaseProps = {
    label,
    helptext,
    helptextHeader,
    tooltip,
    errorMessage: rawErrors,
    required,
    isDisabled: disabled || readonly,
    className,
    size,
    labelSize,
    options: componentOptions,
    placeholder,
    displayOptionalLabel: true,
  }

  if (isMulti) {
    return (
      <WidgetWrapper id={id} options={options}>
        <MultiSelect
          value={value as string[] | undefined}
          onChange={onChange}
          {...componentProps}
        />
      </WidgetWrapper>
    )
  }

  return (
    <WidgetWrapper id={id} options={options}>
      <SingleSelect value={value as string | undefined} onChange={onChange} {...componentProps} />
    </WidgetWrapper>
  )
}

export default SelectWidgetRJSF

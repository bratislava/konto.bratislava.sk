import { ChevronDownIcon, CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import Select, {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  MultiValueRemoveProps,
  OptionProps,
  Props as ReactSelectProps,
} from 'react-select'
import { twMerge } from 'tailwind-merge'

import CheckboxIcon from '../../../icon-components/CheckboxIcon'
import { FieldAdditionalProps, FieldBaseProps } from '../../FieldBase'
import FieldWrapper from '../../FieldWrapper'

// Inspiration: https://www.jussivirtanen.fi/writing/styling-react-select-with-tailwind
// Docs: https://react-select.com/home

const DropdownIndicator = ({ ...props }: DropdownIndicatorProps) => {
  const { menuIsOpen } = props.selectProps

  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon className={menuIsOpen ? 'rotate-180' : undefined} />
    </components.DropdownIndicator>
  )
}

const ClearIndicator = (props: ClearIndicatorProps) => {
  return (
    <components.ClearIndicator {...props}>
      <CrossIcon />
    </components.ClearIndicator>
  )
}

const MultiValueRemove = (props: MultiValueRemoveProps) => {
  return (
    <components.MultiValueRemove {...props}>
      <CrossIcon />
    </components.MultiValueRemove>
  )
}

const CustomOption = ({ children, ...props }: OptionProps) => {
  return (
    <>
      <components.Option {...props}>
        <div>{children}</div>
        <div aria-hidden>
          <CheckboxIcon checked={props.isSelected} />
        </div>
      </components.Option>
      <div className="mx-5 h-0.5 bg-gray-200 last:hidden" aria-hidden />
    </>
  )
}

type SelectMultiNewProps = Pick<
  ReactSelectProps,
  'isDisabled' | 'value' | 'onChange' | 'options' | 'placeholder'
> &
  FieldBaseProps &
  Pick<FieldAdditionalProps, 'className' | 'width'>

const SelectMultiNew =
  // TODO https://react-select.com/typescript#select-generics
  // <Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>
  ({
    value,
    label,
    helptext,
    tooltip,
    explicitOptional,
    errorMessage,
    options,
    onChange,
    placeholder,
    className,
    width = 'full',
    ...rest
  }: SelectMultiNewProps) => {
    const { t } = useTranslation('account', { keyPrefix: 'SelectField' })

    const isError = !!errorMessage?.length

    return (
      <div
        className={twMerge(
          cx({
            'w-full': width === 'full',
            'w-full md:w-[400px]': width === 'fixed',
          }),
          className,
        )}
      >
        <FieldWrapper
          label={label}
          helptext={helptext}
          tooltip={tooltip}
          required={rest.required}
          explicitOptional={explicitOptional}
          errorMessage={errorMessage}
        >
          <Select
            {...rest}
            unstyled
            value={value}
            options={options}
            // TODO readonly
            // menuIsOpen={isReadOnly ? false : undefined}
            isMulti
            isSearchable={false}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            noOptionsMessage={() => t('noOptions')}
            placeholder={placeholder ?? t('placeholder')}
            className="w-full"
            classNames={{
              // We do not use react-select for single select or search input so far
              // input: () => selectInputStyles,
              // singleValue: () => singleValueStyles,
              control: ({ isFocused }) =>
                cx('rounded-lg border-2 bg-white hover:cursor-pointer', {
                  'border-gray-900': isFocused,
                  'border-gray-200 hover:border-gray-400': !isFocused && !isError,
                  'border-negative-700': isError,
                }),
              placeholder: () => 'text-gray-500',
              valueContainer: () => cx('gap-x-2 gap-y-1 px-3 py-2 lg:px-4 lg:py-3'),
              multiValue: () => 'bg-gray-100 rounded items-center gap-1 pl-2 pr-1.5',
              multiValueLabel: () => 'text-p3',
              multiValueRemove: () =>
                'hover:bg-negative-100 hover:text-red-800 rounded h-5 [&>svg]:w-4 [&>svg]:h-4',
              indicatorsContainer: () => 'gap-3 py-2 pr-3 lg:py-3 lg:pr-4',
              clearIndicator: () => 'p-1.5 -m-1.5 rounded-md hover:bg-gray-100',
              indicatorSeparator: () => 'hidden',
              dropdownIndicator: () => 'p-1.5 -m-1.5 rounded-md',
              menu: () => 'py-2 mt-2 border-2 border-gray-900 bg-white rounded-lg',
              groupHeading: () => 'ml-3 mt-2 mb-1 text-gray-500 text-sm',
              option: ({ isFocused }) =>
                cx('!flex items-center justify-between px-5 py-3 hover:cursor-pointer', {
                  'bg-gray-100 active:bg-gray-200': isFocused,
                }),
              noOptionsMessage: () => 'px-4 py-3',
            }}
            components={{
              Option: CustomOption,
              DropdownIndicator,
              ClearIndicator,
              MultiValueRemove,
            }}
          />
        </FieldWrapper>
      </div>
    )
  }

export default SelectMultiNew

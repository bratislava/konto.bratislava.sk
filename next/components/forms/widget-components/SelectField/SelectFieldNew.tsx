import { CheckInCircleIcon, ChevronDownIcon, CrossIcon } from '@assets/ui-icons'
import { useControlledState } from '@react-stately/utils'
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

import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'
import CheckboxIcon from '../../icon-components/CheckboxIcon'

// Inspiration: https://www.jussivirtanen.fi/writing/styling-react-select-with-tailwind
// Docs: https://react-select.com/home

// might not be exhaustive, feel free to expand as needed
export type SelectOption = { value: string; label: string; description?: string }

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
  // need help here - having to unwrap 'unknown' on 5 lines is ridiculous
  const description =
    (typeof props.data === 'object' &&
      props.data !== null &&
      'description' in props.data &&
      typeof props?.data?.description === 'string' &&
      props.data.description) ||
    ''
  return (
    <>
      <components.Option {...props}>
        {description ? (
          <div>
            <div className="text-p1-semibold">{children}</div>
            <div className="text-p2">{description}</div>
          </div>
        ) : (
          <div>{children}</div>
        )}
        <div aria-hidden>
          {props.isMulti ? (
            <CheckboxIcon checked={props.isSelected} />
          ) : props.isSelected ? (
            <CheckInCircleIcon />
          ) : null}
        </div>
      </components.Option>
      <div className="mx-5 h-0.5 bg-gray-200 last:hidden" aria-hidden />
    </>
  )
}

// using onChange from ReactSelectProps would lead to issue as described here https://github.com/JedWatson/react-select/issues/4800#issuecomment-926993221
type SelectMultiNewProps = Pick<
  ReactSelectProps,
  'isDisabled' | 'value' | 'options' | 'placeholder' | 'isMulti' | 'isSearchable'
> & {
  onChange?: (value: unknown) => void
} &
  FieldWrapperProps & {
  className?: string
  width?: 'full' | 'fixed'
}
const SelectMultiNew =
  // TODO https://react-select.com/typescript#select-generics
  // <Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>
  ({
    value,
    label,
    helptext,
    helptextHeader,
    tooltip,
    errorMessage,
    options,
    onChange,
    placeholder,
    className,
    size,
    width = 'full',
    displayOptionalLabel,
    ...rest
  }: SelectMultiNewProps) => {
    const { t } = useTranslation('account', { keyPrefix: 'SelectField' })

    const [state, setState] = useControlledState(value, undefined, onChange ?? (() => null))
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
          helptextHeader={helptextHeader}
          tooltip={tooltip}
          required={rest.required}
          errorMessage={errorMessage}
          displayOptionalLabel={displayOptionalLabel}
        >
          <Select
            {...rest}
            unstyled
            value={state}
            onChange={setState}
            options={options}
            // TODO readonly
            // menuIsOpen={isReadOnly ? false : undefined}
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

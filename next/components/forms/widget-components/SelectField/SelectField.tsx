import { CheckInCircleIcon, ChevronDownIcon, CrossIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useId } from 'react'
import Select, {
  ClearIndicatorProps,
  components,
  DropdownIndicatorProps,
  GroupBase,
  MultiValueRemoveProps,
  OptionProps,
  Props as ReactSelectProps,
} from 'react-select'
import { OptionsOrGroups } from 'react-select/dist/declarations/src/types'
import { twMerge } from 'tailwind-merge'

import CheckboxIcon from '../../icon-components/CheckboxIcon'
import FieldWrapper, { FieldWrapperProps } from '../FieldWrapper'

export type SelectOption = { value: string; label: string; description?: string }

const DropdownIndicator = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  ...props
}: DropdownIndicatorProps<Option, IsMulti, Group>) => {
  const { menuIsOpen, isDisabled } = props.selectProps

  return (
    <components.DropdownIndicator {...props}>
      <ChevronDownIcon
        data-cy="dropdown-close"
        className={cx({ 'rotate-180': menuIsOpen, 'text-gray-400': isDisabled })}
      />
    </components.DropdownIndicator>
  )
}

const ClearIndicator = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: ClearIndicatorProps<Option, IsMulti, Group>,
) => {
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

const CustomOption = <
  Option extends SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  children,
  selectHasDescriptions,
  ...props
}: OptionProps<Option, IsMulti, Group> & { selectHasDescriptions: boolean }) => {
  const { data, isMulti, isSelected } = props
  const { description } = data

  return (
    <>
      <components.Option {...props}>
        {selectHasDescriptions ? (
          <div>
            <div className="text-p1-semibold">{children}</div>
            {description && <div className="text-p2">{description}</div>}
          </div>
        ) : (
          <div>{children}</div>
        )}
        <div aria-hidden>
          {isMulti ? (
            <CheckboxIcon checked={isSelected} />
          ) : isSelected ? (
            <CheckInCircleIcon />
          ) : null}
        </div>
      </components.Option>
      <div className="mx-5 h-0.5 bg-gray-200 last:hidden" aria-hidden />
    </>
  )
}

type SelectMultiNewProps<
  Option extends SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = Pick<
  ReactSelectProps<Option, IsMulti, Group>,
  | 'isDisabled'
  | 'value'
  | 'options'
  | 'placeholder'
  | 'isMulti'
  | 'isSearchable'
  | 'onChange'
  | 'className'
> &
  FieldWrapperProps

const someOptionHasDescription = <
  Option extends SelectOption,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  options: OptionsOrGroups<Option, Group> | undefined,
) => {
  if (!options) return false

  return options.some((option) =>
    'options' in option ? someOptionHasDescription(option.options) : Boolean(option.description),
  )
}

/**
 * Inspiration: https://www.jussivirtanen.fi/writing/styling-react-select-with-tailwind
 * Docs: https://react-select.com/home
 * Figma: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%2BBK%3A-Component-library?type=design&node-id=11794-3647&mode=design&t=QDLivrb2ukM9SiD9-0
 * Figma Dropdowns: https://www.figma.com/file/17wbd0MDQcMW9NbXl6UPs8/DS-ESBS%2BBK%3A-Component-library?type=design&node-id=810-1889&mode=design&t=QDLivrb2ukM9SiD9-0
 *
 * TODO: The library accepts `isDisabled`, but FieldWrapper provides `disabled`. Synchronize these.
 * TODO: Add possibility to remove value if it's not required.
 */
const SelectField = <
  Option extends SelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  value,
  label,
  helptext,
  helptextHeader,
  tooltip,
  errorMessage,
  options,
  onChange = () => null,
  placeholder,
  className,
  size,
  displayOptionalLabel,
  ...rest
}: SelectMultiNewProps<Option, IsMulti, Group>) => {
  const id = useId()
  const { t } = useTranslation('account', { keyPrefix: 'SelectField' })

  const isError = !!errorMessage?.length
  const hasDescriptions = someOptionHasDescription(options)

  return (
    <div className={twMerge('w-full', className)}>
      <FieldWrapper
        label={label}
        helptext={helptext}
        helptextHeader={helptextHeader}
        tooltip={tooltip}
        required={rest.required}
        errorMessage={errorMessage}
        displayOptionalLabel={displayOptionalLabel}
        htmlFor={id}
      >
        <div data-cy={`select-${label.toLowerCase().replace(/ /g,"-")}`}>
          <Select
            placeholder={null}
            {...rest}
            id={id}
            unstyled
            value={value}
            onChange={onChange}
            options={options}
            closeMenuOnSelect={!rest.isMulti}
            hideSelectedOptions={false}
            noOptionsMessage={() => t('noOptions')}
            className="w-full"
            classNames={{
              control: ({ isFocused, isDisabled }) =>
                cx('rounded-lg border-2 bg-white hover:cursor-pointer', {
                  'border-negative-700': isError,
                  'border-gray-300': isDisabled && !isError,
                  'border-gray-900': isFocused && !isDisabled,
                  'border-gray-200 hover:border-gray-400': !isFocused && !isError && !isDisabled,
                }),
              placeholder: ({ isDisabled }) => (isDisabled ? 'text-gray-500' : 'text-gray-600'),
              valueContainer: ({ isDisabled }) =>
                cx('gap-x-2 gap-y-1 px-3 py-2 lg:px-4 lg:py-3'),
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
              Option: ({ children, ...props }) => (
                <CustomOption {...props} selectHasDescriptions={hasDescriptions}>
                  {children}
                </CustomOption>
              ),
              DropdownIndicator,
              ClearIndicator,
              MultiValueRemove,
            }}
          />
        </div>
      </FieldWrapper>
    </div>
  )
}

export default SelectField

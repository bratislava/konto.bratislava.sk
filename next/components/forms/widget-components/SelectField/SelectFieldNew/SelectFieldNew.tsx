import { ChevronDownIcon, ChevronUpIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'
import { Button, ListBox, Popover, Select, SelectProps, SelectValue } from 'react-aria-components'

import FieldWrapper from '../../FieldWrapper'
import ListBoxItem, { FieldBasePropsNew, SelectItem } from './ListBoxItem'

type SelectFieldProps<T extends object> = {
  items: SelectItem[]
  isDivider?: boolean
} & Omit<SelectProps<T>, 'validationState'> &
  FieldBasePropsNew

const SelectFieldNew = <T extends object>({
  className,
  items,
  isDivider = true,
  label,
  tooltip,
  helptext,
  explicitOptional,
  errorMessages,
  width = 'full',
  ...rest
}: SelectFieldProps<T>) => {
  const isInvalid = !!errorMessages?.length

  return (
    <Select
      className={cx({ 'w-full': width === 'full', 'w-full md:w-[400px]': width === 'fixed' })}
      isInvalid={isInvalid}
      {...rest}
    >
      {({ isFocused, isOpen }) => (
        <FieldWrapper
          label={label}
          helptext={helptext}
          tooltip={tooltip}
          required={rest.isRequired}
          explicitOptional={explicitOptional}
          errorMessage={errorMessages}
        >
          <Button
            className={cx(
              'flex w-full justify-between rounded-lg border-2 bg-white px-4 py-3 outline-none disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
              {
                'border-negative-700': isInvalid,
                'border-gray-900': isFocused,
              },
            )}
          >
            <SelectValue className="data-[placeholder]:text-gray-500">
              {({ selectedText }) => selectedText ?? rest.placeholder}
            </SelectValue>
            <span aria-hidden>{isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
          </Button>

          {/* Styling docs https://react-spectrum.adobe.com/react-aria/Select.html#popover-1 */}
          <Popover className="w-[--trigger-width] overflow-y-scroll rounded-md border-2 bg-white py-2">
            <ListBox>
              {items.map((item) => (
                <ListBoxItem key={item.id} {...item} isDivider={isDivider} />
              ))}
            </ListBox>
          </Popover>
        </FieldWrapper>
      )}
    </Select>
  )
}

export default SelectFieldNew

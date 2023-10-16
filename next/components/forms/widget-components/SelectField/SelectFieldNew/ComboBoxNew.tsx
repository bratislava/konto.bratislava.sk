import { ChevronDownIcon, ChevronUpIcon } from '@assets/ui-icons'
import React from 'react'
import { Button, ComboBox, ComboBoxProps, Input, ListBox, Popover } from 'react-aria-components'

import FieldWrapper from '../../FieldWrapper'
import ListBoxItem, { FieldBasePropsNew, SelectItem } from './ListBoxItem'

type ComboBoxFieldProps<T extends object> = {
  items: SelectItem[]
  isDivider?: boolean
} & Omit<ComboBoxProps<T>, 'validationState'> &
  FieldBasePropsNew

const ComboBoxNew = <T extends object>({
  className,
  items,
  isDivider = true,
  label,
  tooltip,
  errorMessages,
  helptext,
  explicitOptional,
  ...rest
}: ComboBoxFieldProps<T>) => {
  // We compute validationState based on error messages
  const isInvalid = !!errorMessages?.length

  return (
    <ComboBox className="w-full" isInvalid={isInvalid} {...rest}>
      {({ isOpen }) => (
        <FieldWrapper
          label={label}
          helptext={helptext}
          tooltip={tooltip}
          required={rest.isRequired}
          explicitOptional={explicitOptional}
          errorMessage={errorMessages}
          disabled={rest.isDisabled}
        >
          <div className="flex">
            <Input className="flex w-full rounded-lg border-2 bg-white py-3 pl-4 pr-10 outline-none focus:border-gray-900 disabled:border-gray-300 disabled:bg-gray-100 aria-[invalid]:border-negative-700" />
            <Button className="-ml-14 flex items-center justify-center px-4 py-3">
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>

          <Popover className="w-[--trigger-width] overflow-y-scroll rounded-md border-2 bg-white py-2">
            <ListBox>
              {items.map((item) => (
                <ListBoxItem key={item.id} {...item} isDivider={isDivider} />
              ))}
            </ListBox>
          </Popover>
        </FieldWrapper>
      )}
    </ComboBox>
  )
}

export default ComboBoxNew

import { ChevronDownIcon, ChevronUpIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'
import { Button, ComboBox, ComboBoxProps, Input, ListBox, Popover } from 'react-aria-components'

import FieldErrorMessage from '../../../info-components/FieldErrorMessage'
import FieldHeader from '../../../info-components/FieldHeader'
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
    <ComboBox className="w-full" validationState={isInvalid ? 'invalid' : 'valid'} {...rest}>
      {({ isFocused, isOpen }) => (
        <>
          <FieldHeader
            label={label}
            helptext={helptext}
            tooltip={tooltip}
            required={rest.isRequired}
            explicitOptional={explicitOptional}
          />

          <div className="flex">
            <Input
              className={cx(
                'flex w-full rounded-lg border-2 bg-white py-3 pl-4 pr-10 outline-none disabled:border-gray-300 disabled:bg-gray-100 aria-[invalid]:border-negative-700',
                {
                  'border-gray-900': isFocused,
                },
              )}
            />
            <Button className="-ml-14 flex items-center justify-center px-4 py-3">
              {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </div>

          <FieldErrorMessage errorMessage={errorMessages} />

          <Popover className="w-[--trigger-width] overflow-y-scroll rounded-md border-2 bg-white py-2">
            <ListBox>
              {items.map((item) => (
                <ListBoxItem {...item} isDivider={isDivider} />
              ))}
            </ListBox>
          </Popover>
        </>
      )}
    </ComboBox>
  )
}

export default ComboBoxNew

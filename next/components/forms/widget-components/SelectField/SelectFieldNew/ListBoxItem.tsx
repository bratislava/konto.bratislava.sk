import { CheckInCircleIcon } from '@assets/ui-icons'
import cx from 'classnames'
import React from 'react'
import { Item, Text } from 'react-aria-components'

export type FieldBasePropsNew = {
  label: string
  tooltip?: string
  errorMessages?: string[]
  helptext?: string
  explicitOptional?: boolean
  width?: 'full' | 'fixed'
}

export type SelectItem = {
  id: string | number
  label?: string
  description?: string
}

export type ListBoxItemProps = SelectItem & { isDivider?: boolean }

const ListBoxItem = ({ label, id, description, isDivider }: ListBoxItemProps) => {
  return (
    <Item
      textValue={label}
      className={({ isHovered }) =>
        cx('cursor-pointer px-5 outline-none', {
          'bg-gray-100': isHovered,
          'after:h-0.5 after:bg-gray-200 after:[&:not(:last-child)]:block': isDivider,
        })
      }
    >
      {({ isSelected }) => (
        <div className="flex justify-between py-3">
          <div className="flex flex-col items-start gap-1">
            {label ? (
              <Text slot="label" className={cx({ 'font-semibold': description })}>
                {label}
              </Text>
            ) : (
              id
            )}
            {description ? <Text slot="description">{description}</Text> : null}
          </div>
          <span className={cx('shrink-0', { hidden: !isSelected })}>
            <CheckInCircleIcon />
          </span>
        </div>
      )}
    </Item>
  )
}

export default ListBoxItem

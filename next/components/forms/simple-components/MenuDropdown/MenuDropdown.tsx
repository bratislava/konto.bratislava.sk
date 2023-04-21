import ThreePointsIcon from '@assets/images/forms/three-points-icon.svg'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import cx from 'classnames'
// import Button from 'components/forms/simple-components/Button'
import FormMenuItem from 'components/forms/simple-components/MenuDropdown/FormMenuItem'
import HeaderMenuItem from 'components/forms/simple-components/MenuDropdown/HeaderMenuItem'
import React, { ReactNode, useState } from 'react'

export type MenuItemBase = {
  title: string
  icon?: ReactNode
  onPress?: () => void
  url?: string
}

type MenuDropdownBase = {
  items: MenuItemBase[]
  itemVariant?: 'form' | 'header'
}

const MenuDropdown = ({ items, itemVariant = 'form' }: MenuDropdownBase) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <DropdownMenu.Root onOpenChange={() => setIsOpen((prev) => !prev)}>
      <DropdownMenu.Trigger asChild>
        {/* <Button size="sm" variant="category-outline" icon={<ThreePointsIcon />} /> */}
        <button
          type="button"
          className={cx(
            'w-10 h-10 border-2 border-main-700 flex justify-center items-center rounded-lg focus:outline-none focus:border-main-800 focus:text-gray-800',
            { 'text-gray-800 border-main-800': isOpen },
          )}
        >
          <ThreePointsIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          loop
          align="end"
          className="bg-gray-0 shadow-md rounded-lg py-2"
          sideOffset={2}
        >
          {itemVariant === 'form' &&
            items?.map((item, i) => (
              <FormMenuItem
                key={i}
                icon={item.icon}
                title={item.title}
                url={item.url}
                onPress={item.onPress}
              />
            ))}
          {itemVariant === 'header' &&
            items?.map((item, i) => (
              <HeaderMenuItem
                key={i}
                icon={item.icon}
                title={item.title}
                url={item.url}
                onPress={item.onPress}
              />
            ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default MenuDropdown

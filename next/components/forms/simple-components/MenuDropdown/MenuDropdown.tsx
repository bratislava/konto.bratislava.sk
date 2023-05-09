import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import FormMenuItem from 'components/forms/simple-components/MenuDropdown/FormMenuItem'
import HeaderMenuItem from 'components/forms/simple-components/MenuDropdown/HeaderMenuItem'
import MenuTrigger from 'components/forms/simple-components/MenuDropdown/MenuTrigger'
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
  buttonTrigger?: ReactNode
  buttonVariant?: 'gray' | 'main' | 'none'
}

const MenuDropdown = ({
  items,
  itemVariant = 'form',
  buttonTrigger,
  buttonVariant = 'none',
}: MenuDropdownBase) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <DropdownMenu.Root onOpenChange={() => setIsOpen((prev) => !prev)}>
      <DropdownMenu.Trigger asChild>
        <MenuTrigger buttonTrigger={buttonTrigger} buttonVariant={buttonVariant} isOpen={isOpen} />
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

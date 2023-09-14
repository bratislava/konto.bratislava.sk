import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import FormMenuItem from 'components/forms/simple-components/MenuDropdown/FormMenuItem'
import HeaderMenuItem from 'components/forms/simple-components/MenuDropdown/HeaderMenuItem'
import MenuTrigger from 'components/forms/simple-components/MenuDropdown/MenuTrigger'
import React, { Dispatch, ReactNode, SetStateAction } from 'react'

export type MenuItemBase = {
  id?: number
  title: string
  icon?: ReactNode
  onPress?: () => Promise<void> | void
  url?: string
  itemClassName?: string
}

type MenuDropdownBase = {
  items: MenuItemBase[]
  itemVariant?: 'form' | 'header'
  buttonTrigger?: ReactNode
  buttonClassName?: string
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

// TODO use controlled state for setIsOpen
const MenuDropdown = ({
  items,
  itemVariant = 'form',
  buttonTrigger,
  buttonClassName,
  setIsOpen,
}: MenuDropdownBase) => {
  return (
    <DropdownMenu.Root onOpenChange={() => setIsOpen && setIsOpen((prev) => !prev)}>
      <DropdownMenu.Trigger asChild>
        <MenuTrigger className={buttonClassName} buttonTrigger={buttonTrigger} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          loop
          align="end"
          className="z-50 rounded-lg bg-gray-0 py-2 shadow-md"
          sideOffset={2}
        >
          {itemVariant === 'form' &&
            items?.map((item, i) => (
              <FormMenuItem
                key={i}
                className={item.itemClassName}
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
                itemClassName={item.itemClassName}
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

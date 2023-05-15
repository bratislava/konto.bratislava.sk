import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import FormMenuItem from 'components/forms/simple-components/MenuDropdown/FormMenuItem'
import HeaderMenuItem from 'components/forms/simple-components/MenuDropdown/HeaderMenuItem'
import MenuTrigger from 'components/forms/simple-components/MenuDropdown/MenuTrigger'
import { useGlobalStateContext } from 'components/forms/states/GlobalState'
import React, { ReactNode } from 'react'

export type MenuDropdownStateBase = {
  id: string
  isOpen: boolean
}

export type MenuItemBase = {
  id?: number
  title: string
  icon?: ReactNode
  onPress?: () => Promise<void> | void
  url?: string
  itemClassName?: string
}

type MenuDropdownBase = {
  id: string
  items: MenuItemBase[]
  itemVariant?: 'form' | 'header'
  buttonTrigger?: ReactNode
  buttonClassName?: string
}

const MenuDropdown = ({
  id,
  items,
  itemVariant = 'form',
  buttonTrigger,
  buttonClassName,
}: MenuDropdownBase) => {
  const { setGlobalState, globalState } = useGlobalStateContext()

  return (
    <DropdownMenu.Root
      onOpenChange={() =>
        setGlobalState({
          ...globalState,
          dropdownMenuState: { id, isOpen: !globalState.dropdownMenuState?.isOpen },
        })
      }
    >
      <DropdownMenu.Trigger asChild>
        <MenuTrigger className={buttonClassName} buttonTrigger={buttonTrigger} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          loop
          align="end"
          className="bg-gray-0 shadow-md rounded-lg py-2 z-50"
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
                className={item.itemClassName}
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

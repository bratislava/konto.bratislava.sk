import FormMenuItem from 'components/forms/simple-components/Menu/FormMenuItem'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import React, { ReactNode } from 'react'
import { Button, Menu, MenuTrigger, Popover } from 'react-aria-components'

type MenuBase = {
  items: MenuItemBase[]
  buttonClassName?: string
  buttonIcon?: ReactNode
  offset?: number
}

const MenuAria = ({ items, buttonClassName, buttonIcon, offset, ...rest }: MenuBase) => {
  return (
    <MenuTrigger>
      <Button className={buttonClassName}>{buttonIcon}</Button>
      <Popover offset={offset} placement="bottom right">
        <Menu
          className="bg-white focus:outline-none py-2 rounded-lg shadow-md"
          items={items}
          //   onAction={alert}
          {...rest}
        >
          {(item: MenuItemBase) => <FormMenuItem item={item} />}
        </Menu>
      </Popover>
    </MenuTrigger>
  )
}

export default MenuAria

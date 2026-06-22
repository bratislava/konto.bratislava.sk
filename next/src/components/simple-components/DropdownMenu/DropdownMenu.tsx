import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'
import { Dispatch, ReactNode, SetStateAction } from 'react'

import FormMenuItem from '@/src/components/simple-components/DropdownMenu/FormMenuItem'
import HeaderMenuItem from '@/src/components/simple-components/DropdownMenu/HeaderMenuItem'
import cn from '@/src/utils/cn'

export type DropdownMenuItemProps = {
  id?: number
  title: string
  icon?: ReactNode
  onPress?: () => Promise<void> | void
  url?: string
  itemClassName?: string
}

type DropdownMenuProps = {
  items: DropdownMenuItemProps[]
  itemVariant?: 'form' | 'header'
  buttonTrigger?: ReactNode
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

// TODO use controlled state for setIsOpen
const DropdownMenu = ({
  items,
  itemVariant = 'form',
  buttonTrigger,
  setIsOpen,
}: DropdownMenuProps) => {
  return (
    <RadixDropdownMenu.Root onOpenChange={() => setIsOpen && setIsOpen((prev) => !prev)}>
      <RadixDropdownMenu.Trigger asChild>{buttonTrigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          loop
          align="end"
          className="z-50 rounded-lg bg-gray-0 py-2 shadow-md"
          sideOffset={2}
        >
          {itemVariant === 'form' &&
            items.map((item, index) => (
              <FormMenuItem
                key={index}
                className={cn('rounded-sm menu-dropdown-focus-ring', item.itemClassName)}
                icon={item.icon}
                title={item.title}
                url={item.url}
                onPress={item.onPress}
              />
            ))}
          {itemVariant === 'header' &&
            items.map((item, index) => (
              <HeaderMenuItem
                key={index}
                itemClassName={cn('rounded-sm menu-dropdown-focus-ring', item.itemClassName)}
                icon={item.icon}
                title={item.title}
                url={item.url}
                onPress={item.onPress}
              />
            ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  )
}

export default DropdownMenu

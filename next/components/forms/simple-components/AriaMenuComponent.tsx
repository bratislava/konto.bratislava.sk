import type { ItemProps, MenuProps, MenuTriggerProps } from 'react-aria-components'
import { Item } from 'react-stately'

interface MyMenuButtonProps<T> extends MenuProps<T>, Omit<MenuTriggerProps, 'children'> {
  label?: string
}
// const MyItem = (props: ItemProps) => {
//   return (
//     <Item
//       {...props}
//       className={({ isFocused, isSelected }) => `my-item ${isFocused ? 'focused' : ''}`}
//     />
//   )
// }

const AriaMenuComponent = <T extends object>({
  label,
  children,
  ...props
}: MyMenuButtonProps<T>) => {
  return (
    <div />
    // <MenuTrigger {...props}>
    //   <Button>{label}</Button>
    //   <Popover>
    //     <Menu {...props}>{children}</Menu>
    //   </Popover>
    // </MenuTrigger>
  )
}

export default AriaMenuComponent

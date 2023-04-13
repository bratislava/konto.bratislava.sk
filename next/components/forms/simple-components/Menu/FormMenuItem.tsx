import cx from 'classnames'
import { MenuItemBase } from 'components/forms/simple-components/Menu/MenuAria'
import { Item } from 'react-aria-components'

type FormMenuItemBase = {
  item: MenuItemBase
}

const FormMenuItem = ({ item, ...rest }: FormMenuItemBase) => {
  return (
    <Item
      {...rest}
      id={item.key}
      className={({ isFocused, isHovered }) =>
        cx(' font-sans', {
          'text-p2-semibold outline-none': isFocused,
          'text-p2-semibold': isHovered,
          'text-p2': !isHovered,
        })
      }
    >
      <div className="flex items-center gap-3 cursor-pointer py-3 px-5">
        <span className="w-6 h-6">{item.icon}</span>
        <span className="min-w-[172px]">{item.title}</span>
      </div>
    </Item>
  )
}

export default FormMenuItem

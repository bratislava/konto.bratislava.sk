import type { Node } from '@react-types/shared'
import cx from 'classnames'
import { useRef } from 'react'
import { useMenuItem } from 'react-aria'
import { TreeState } from 'react-stately'

interface MenuItemProps<T> {
  item: Node<T>
  state: TreeState<T>
}

const FormMenuItem = <T extends object>({ item, state }: MenuItemProps<T>) => {
  const ref = useRef(null)
  const { menuItemProps } = useMenuItem({ key: item.key }, state, ref)

  const isFocused = state.selectionManager.focusedKey === item.key
  console.log(item)

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={cx('font-sans py-3 px-5 focus:outline-none', {
        'bg-gray-50': isFocused,
      })}
    >
      {item.rendered}
      {/* <span className="w-6 h-6 flex">{item.value.icon}</span> */}

      {/* <span className="text-p2 font-sans min-w-[208px]">{item.value.title}</span> */}
    </li>
  )
}

export default FormMenuItem

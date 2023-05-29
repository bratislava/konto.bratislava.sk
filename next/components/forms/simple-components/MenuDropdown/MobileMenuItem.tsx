import cx from 'classnames'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'
import { Dispatch } from 'react'

type MobileMenuItemBase = {
  item: MenuItemBase
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
}

const MobileMenuItem = ({ item, setIsOpen }: MobileMenuItemBase) => {
  const clickHandler = () => {
    if (item.onPress) {
      item.onPress()
      setIsOpen(false)
    }
  }

  return item.url ? (
    <Link
      onClick={() => setIsOpen(false)}
      href={item.url}
      className={cx(
        'text-p2 hover:text-p2-semibold focus:text-p2-semibold flex items-center gap-3 px-5 py-3 cursor-pointer focus:outline-none',
        item.itemClassName,
      )}
    >
      <span className="w-6 h-6">{item.icon}</span>
      <span className="min-w-[172px]">{item.title}</span>
    </Link>
  ) : (
    <button
      type="button"
      onClick={clickHandler}
      className={cx(
        'text-p2 hover:text-p2-semibold focus:text-p2-semibold flex items-center gap-3 px-5 py-3 cursor-pointer focus:outline-none',
        item.itemClassName,
      )}
    >
      <span className="w-6 h-6">{item.icon}</span>
      <span>{item.title}</span>
    </button>
  )
}

export default MobileMenuItem

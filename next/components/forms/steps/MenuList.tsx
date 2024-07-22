import cx from 'classnames'
import Link from 'next/link'

import { useFormMenuItems } from '../useFormMenuItems'

const MenuList = () => {
  const menuItems = useFormMenuItems()

  return (
    <ul className="mt-4 flex flex-col gap-3 border-t-2 border-gray-200 pt-4 lg:hidden">
      {menuItems.map((menuItem, index) =>
        menuItem.url ? (
          <li className="w-max" key={index}>
            <Link href={menuItem.url}>
              <div className={cx('flex items-center gap-3', menuItem.className)}>
                {menuItem.icon}
                <span className="text-p2">{menuItem.title}</span>
              </div>
            </Link>
          </li>
        ) : (
          <li className="w-max" key={index}>
            <button type="button" onClick={menuItem.onPress} data-cy={menuItem.dataCy ?? ''}>
              <div className={cx('flex items-center gap-3', menuItem.className)}>
                {menuItem.icon}
                <span className="text-p2">{menuItem.title}</span>
              </div>
            </button>
          </li>
        ),
      )}
    </ul>
  )
}

export default MenuList

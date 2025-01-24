import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import cx from 'classnames'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'

const HeaderMenuItem = ({ title, icon, url, onPress, disabled }: MenuItemBase) => {
  const showLink = url && !disabled

  return showLink ? (
    <Link
      className="flex items-center gap-3"
      href={url}
      data-cy={`${url.replaceAll('/', '')}-menu-item`}
    >
      {/* Cannot be disabled, so no need to handle disable variant */}
      <DropdownMenu.Item className="text-p2 hover:text-p2-semibold focus:text-p2-semibold flex cursor-pointer items-center gap-3 px-5 py-2 font-sans focus:outline-none">
        <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
        <span className="min-w-[138px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={disabled ? () => {} : onPress}
      className={cx(
        'text-p2 flex items-center gap-3 px-5 py-2',
        { 'cursor-not-allowed opacity-50': disabled },
        {
          'hover:text-p2-semibold focus:text-p2-semibold cursor-pointer focus:outline-none':
            !disabled,
        },
      )}
      disabled={disabled}
      data-cy="logout-button"
    >
      <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
      <span className="min-w-[138px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default HeaderMenuItem

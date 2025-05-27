import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'

const HeaderMenuItem = ({ title, icon, url, onPress }: MenuItemBase) => {
  return url ? (
    <Link
      className="flex items-center gap-3"
      href={url}
      data-cy={`${url.replaceAll('/', '')}-menu-item`}
    >
      <DropdownMenu.Item className="flex cursor-pointer items-center gap-3 px-5 py-2 font-sans text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden">
        <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
        <span className="min-w-[138px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className="flex cursor-pointer items-center gap-3 px-5 py-2 text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden"
      data-cy="logout-button"
    >
      <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
      <span className="min-w-[138px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default HeaderMenuItem

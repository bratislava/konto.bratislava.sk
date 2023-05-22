import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import Link from 'next/link'

const HeaderMenuItem = ({ title, icon, url, onPress }: MenuItemBase) => {
  return url ? (
    <Link className="flex items-center gap-3" href={url}>
      <DropdownMenu.Item className="text-p2 hover:text-p2-semibold focus:text-p2-semibold font-sans flex items-center gap-3 px-5 py-2 cursor-pointer focus:outline-none">
        <span className="p-[10px] bg-gray-50 rounded-xl">{icon}</span>
        <span className="min-w-[138px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className="text-p2 hover:text-p2-semibold focus:text-p2-semibold flex items-center gap-3 px-5 py-2 cursor-pointer focus:outline-none"
    >
      <span className="p-[10px] bg-gray-50 rounded-xl">{icon}</span>
      <span className="min-w-[138px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default HeaderMenuItem

import { Typography } from '@bratislava/component-library'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'

import { MenuItemBase } from '@/src/components/simple-components/MenuDropdown/MenuDropdown'

const HeaderMenuItem = ({ title, icon, url, onPress }: MenuItemBase) => {
  return url ? (
    <Link
      className="flex items-center gap-3"
      href={url}
      data-cy={`${url.replaceAll('/', '')}-menu-item`}
    >
      <DropdownMenu.Item className="flex cursor-pointer items-center gap-3 px-5 py-2 font-sans hover:font-semibold focus:font-semibold focus:outline-hidden">
        <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
        <Typography variant="p-small" as="span" className="min-w-[138px]">
          {title}
        </Typography>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className="flex cursor-pointer items-center gap-3 px-5 py-2 hover:font-semibold focus:font-semibold focus:outline-hidden"
      data-cy="logout-button"
    >
      <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
      <Typography variant="p-small" as="span" className="min-w-[138px]">
        {title}
      </Typography>
    </DropdownMenu.Item>
  )
}

export default HeaderMenuItem

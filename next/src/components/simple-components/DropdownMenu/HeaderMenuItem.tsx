import { Typography } from '@bratislava/component-library'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

import { DropdownMenuItemProps } from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import MLink from '@/src/components/simple-components/MLink'
import cn from '@/src/utils/cn'

const HeaderMenuItem = ({ title, icon, url, onPress, itemClassName }: DropdownMenuItemProps) => {
  return url ? (
    <MLink
      className="flex items-center gap-3"
      href={url}
      data-cy={`${url.replaceAll('/', '')}-menu-item`}
    >
      <DropdownMenu.Item
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-sm px-5 py-2 font-sans',
          itemClassName,
        )}
      >
        <span className="rounded-xl bg-gray-50 p-[10px]">{icon}</span>
        <Typography variant="p-small" as="span" className="min-w-[138px]">
          {title}
        </Typography>
      </DropdownMenu.Item>
    </MLink>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className={cn('flex cursor-pointer items-center gap-3 rounded-sm px-5 py-2', itemClassName)}
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

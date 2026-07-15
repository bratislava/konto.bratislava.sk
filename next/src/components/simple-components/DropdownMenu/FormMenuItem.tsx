import { Typography } from '@bratislava/component-library'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { ReactNode } from 'react'

import cn from '@/src/utils/cn'

type FormMenuItemBase = {
  title: string
  icon?: ReactNode
  url?: string
  className?: string
  onPress?: () => void
}

const FormMenuItem = ({ title, icon, url, onPress, className }: FormMenuItemBase) => {
  return url ? (
    <Link href={url} className="flex items-center gap-3">
      <DropdownMenu.Item
        className={cn(
          'flex cursor-pointer items-center gap-3 px-5 py-3 hover:font-semibold focus:font-semibold focus:outline-hidden',
          className,
        )}
      >
        <span className="size-6">{icon}</span>
        <Typography variant="p-small" className="min-w-[172px]">
          {title}
        </Typography>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-5 py-3 hover:font-semibold focus:font-semibold focus:outline-hidden',
        className,
      )}
    >
      <span className="size-6">{icon}</span>
      <Typography variant="p-small" className="min-w-[172px]">
        {title}
      </Typography>
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

import { Typography } from '@bratislava/component-library'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import NextLink from 'next/link'
import { ReactNode } from 'react'

import cn from '@/src/utils/cn'

type FormMenuItemBase = {
  title: string
  icon?: ReactNode
  url?: string
  className?: string
  onPress?: () => void
  isDisabled?: boolean
}

const FormMenuItem = ({ title, icon, url, onPress, className, isDisabled }: FormMenuItemBase) => {
  return url ? (
    <NextLink href={url} className="flex items-center gap-3">
      <DropdownMenu.Item
        disabled={isDisabled}
        className={cn(
          'flex cursor-pointer items-center gap-3 px-5 py-3 hover:font-semibold focus:font-semibold focus:outline-hidden data-disabled:cursor-not-allowed data-disabled:font-normal data-disabled:opacity-50',
          className,
        )}
      >
        <span className="size-6">{icon}</span>
        <Typography variant="p-small" className="min-w-[172px]">
          {title}
        </Typography>
      </DropdownMenu.Item>
    </NextLink>
  ) : (
    <DropdownMenu.Item
      // `disabled` only stops Radix's own onSelect, our onClick would still fire.
      onClick={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-5 py-3 hover:font-semibold focus:font-semibold focus:outline-hidden data-disabled:cursor-not-allowed data-disabled:font-normal data-disabled:opacity-50',
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

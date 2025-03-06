import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { ReactNode } from 'react'
import cn from '../../../../frontend/cn'

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
          'text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden flex cursor-pointer items-center gap-3 px-5 py-3',
          className,
        )}
      >
        <span className="size-6">{icon}</span>
        <span className="min-w-[172px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className={cn(
        'text-p2 hover:text-p2-semibold focus:text-p2-semibold focus:outline-hidden flex cursor-pointer items-center gap-3 px-5 py-3',
        className,
      )}
    >
      <span className="size-6">{icon}</span>
      <span className="min-w-[172px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import cx from 'classnames'
import Link from 'next/link'
import { ReactNode } from 'react'

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
        className={cx(
          'text-p2 hover:text-p2-semibold focus:text-p2-semibold flex cursor-pointer items-center gap-3 px-5 py-3 focus:outline-none',
          className,
        )}
      >
        <span className="h-6 w-6">{icon}</span>
        <span className="min-w-[172px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className={cx(
        'text-p2 hover:text-p2-semibold focus:text-p2-semibold flex cursor-pointer items-center gap-3 px-5 py-3 focus:outline-none',
        className,
      )}
    >
      <span className="h-6 w-6">{icon}</span>
      <span className="min-w-[172px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

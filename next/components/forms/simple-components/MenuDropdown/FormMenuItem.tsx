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
  disabled?: boolean
}

const FormMenuItem = ({ title, icon, url, onPress, className, disabled }: FormMenuItemBase) => {
  const showLink = url && !disabled

  return showLink ? (
    <Link href={url} className="flex items-center gap-3">
      {/* Cannot be disabled, so no need to handle disable variant */}
      <DropdownMenu.Item
        className={cx(
          'text-p2 hover:text-p2-semibold focus:text-p2-semibold flex cursor-pointer items-center gap-3 px-5 py-3 focus:outline-none',
          className,
        )}
      >
        <span className="size-6">{icon}</span>
        <span className="min-w-[172px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={disabled ? () => {} : onPress}
      className={cx(
        'text-p2 flex items-center gap-3 px-5 py-3',
        className,
        { 'cursor-not-allowed opacity-50': disabled },
        {
          'hover:text-p2-semibold focus:text-p2-semibold cursor-pointer focus:outline-none':
            !disabled,
        },
      )}
      disabled={disabled}
    >
      <span className="size-6">{icon}</span>
      <span className="min-w-[172px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

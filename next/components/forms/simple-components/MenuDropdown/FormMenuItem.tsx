import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { ReactNode } from 'react'

type FormMenuItemBase = {
  title: string
  icon?: ReactNode
  url?: string
  onPress?: () => void
}

const FormMenuItem = ({ title, icon, url, onPress }: FormMenuItemBase) => {
  return url ? (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link href={url} className="flex items-center gap-3">
      <DropdownMenu.Item className="text-p2 hover:text-p2-semibold focus:text-p2-semibold font-sans flex items-center gap-3 px-5 py-3 cursor-pointer focus:outline-none">
        <span className="w-6 h-6">{icon}</span>
        <span className="min-w-[172px]">{title}</span>
      </DropdownMenu.Item>
    </Link>
  ) : (
    <DropdownMenu.Item
      onClick={onPress}
      className="text-p2 hover:text-p2-semibold focus:text-p2-semibold font-sans flex items-center gap-3 px-5 py-3 cursor-pointer focus:outline-none"
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="min-w-[172px]">{title}</span>
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

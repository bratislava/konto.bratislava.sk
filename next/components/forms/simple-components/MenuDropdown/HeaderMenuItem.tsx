import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { ReactNode } from 'react'

type FormMenuItemBase = {
  title: string
  icon?: ReactNode
  url?: string
  onPress?: () => void
}

const HeaderMenuItem = ({ title, icon, url, onPress }: FormMenuItemBase) => {
  return (
    <DropdownMenu.Item
      onClick={onPress}
      className="text-p2 hover:text-p2-semibold focus:text-p2-semibold font-sans flex items-center gap-3 px-5 py-2 cursor-pointer focus:outline-none"
    >
      {url ? (
        <Link className="flex items-center gap-3" href={url}>
          <span className="p-[10px] bg-gray-50 rounded-xl">{icon}</span>
          <span className="min-w-[138px]">{title}</span>
        </Link>
      ) : (
        <>
          <span className="p-[10px] bg-gray-50 rounded-xl">{icon}</span>
          <span className="min-w-[138px]">{title}</span>
        </>
      )}
    </DropdownMenu.Item>
  )
}

export default HeaderMenuItem

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
  return (
    <DropdownMenu.Item
      onClick={onPress}
      className="text-p2 hover:text-p2-semibold focus:text-p2-semibold font-sans flex items-center gap-3 px-5 py-3 cursor-pointer focus:outline-none"
    >
      {url ? (
        <Link className="flex items-center gap-3" href={url}>
          <span className="w-6 h-6">{icon}</span>
          <span className="min-w-[172px]">{title}</span>
        </Link>
      ) : (
        <>
          <span className="w-6 h-6">{icon}</span>
          <span className="min-w-[172px]">{title}</span>
        </>
      )}
    </DropdownMenu.Item>
  )
}

export default FormMenuItem

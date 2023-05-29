import CloseIcon from '@assets/images/new-icons/ui/cross.svg'
// import cx from 'classnames'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import MobileMenuItem from 'components/forms/simple-components/MenuDropdown/MobileMenuItem'
import React, { Dispatch } from 'react'

type MobileMenuDropdownBase = {
  items: MenuItemBase[]
  setIsOpen: Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
}

const MobileMenuDropdown = ({ items, setIsOpen }: MobileMenuDropdownBase) => {
  return (
    <div className="fixed bg-black/50 w-full h-full inset-0 z-50 flex items-end">
      <div className="w-full rounded-t-xl bg-gray-0">
        <div className="flex items-center justify-between py-[18px] px-4 border-b-2 border-gray-200">
          <span className="text-p2-semibold">Akcie</span>
          <CloseIcon onClick={() => setIsOpen(false)} className="cursor-pointer w-6 h-6" />
        </div>
        <div className="flex flex-col py-3">
          {items.map((item, i) => (
            <MobileMenuItem key={i} setIsOpen={setIsOpen} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MobileMenuDropdown

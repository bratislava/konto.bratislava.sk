import { CrossIcon, HamburgerIcon } from '@assets/ui-icons'
import { StatusBar } from 'components/forms/info-components/StatusBar'
import HamburgerMenu from 'components/forms/segments/HambergerMenu/HamburgerMenu'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import FocusTrap from 'focus-trap-react'
import { ReactNode, RefObject } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import Brand from '../../simple-components/Brand'
import { useNavMenuContext } from './navMenuContext'

interface MobileMenuNavBarProps {
  sectionsList?: MenuSectionItemBase[]
  menuItems: MenuItemBase[]
  mobileNavbarRef: RefObject<HTMLDivElement | null>
}

export interface MenuSectionItemBase {
  id: number
  title: string
  icon: ReactNode
  url: string
}

export const MobileNavBar = ({
  sectionsList,
  menuItems,
  mobileNavbarRef,
}: MobileMenuNavBarProps) => {
  const { isMobileMenuOpen, setMobileMenuOpen } = useNavMenuContext()

  return (
    <>
      <div
        id="mobile-navbar"
        className="sticky top-0 left-0 z-40 flex w-full gap-x-6 bg-white lg:hidden"
        ref={mobileNavbarRef}
      >
        <div className="w-full">
          <FocusTrap active={isMobileMenuOpen}>
            <div className="flex h-16 w-full items-center border-b-2 px-8 py-5">
              <div className="flex w-full justify-between">
                <Brand url={ROUTES.HOME} className="grow" />
                {/* event onPress is propagating to menu itself casuing glitches when opening mobile menu,
                becasue of that we are using onClick event and thats why simple button is used */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="-mr-4 px-4 py-5"
                  data-cy="mobile-account-button"
                >
                  <div className="flex w-6 items-center justify-center">
                    {isMobileMenuOpen ? <CrossIcon className="size-6" /> : <HamburgerIcon />}
                  </div>
                </button>
              </div>

              {isMobileMenuOpen && (
                <HamburgerMenu
                  sectionsList={sectionsList}
                  menuItems={menuItems}
                  closeMenu={() => setMobileMenuOpen(false)}
                />
              )}
            </div>
          </FocusTrap>
        </div>
      </div>
      <div className="lg:hidden">
        <StatusBar />
      </div>
    </>
  )
}

export default MobileNavBar

import { CrossIcon, HamburgerIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { StatusBar, useStatusBarContext } from 'components/forms/info-components/StatusBar'
import HamburgerMenu from 'components/forms/segments/HambergerMenu/HamburgerMenu'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import FocusTrap from 'focus-trap-react'
import { ReactNode } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import useElementSize from '../../../../frontend/hooks/useElementSize'
import Brand from '../../simple-components/Brand'
import { useNavMenuContext } from './navMenuContext'

interface MobileMenuNavBarProps {
  className?: string
  sectionsList?: MenuSectionItemBase[]
  menuItems: MenuItemBase[]
}

export interface MenuSectionItemBase {
  id: number
  title: string
  icon: ReactNode
  url: string
}

export const MobileNavBar = ({ className, sectionsList, menuItems }: MobileMenuNavBarProps) => {
  const { statusBarConfiguration } = useStatusBarContext()
  const [mobileRef] = useElementSize([statusBarConfiguration.content])
  const { isMobileMenuOpen, setMobileMenuOpen } = useNavMenuContext()

  return (
    <div className={className}>
      <div
        id="mobile-navbar"
        className={cx(className, 'fixed left-0 top-0 z-40 flex w-full gap-x-6 bg-white lg:hidden')}
        ref={mobileRef}
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
      <div className={cx('h-16', className)} />
      {!isMobileMenuOpen && <StatusBar />}
    </div>
  )
}

export default MobileNavBar

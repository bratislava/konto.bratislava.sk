import FocusTrap from 'focus-trap-react'
import { useTranslation } from 'next-i18next'
import { RefObject } from 'react'

import { CrossIcon, HamburgerIcon } from '@/src/assets/ui-icons'
import HamburgerMenu from '@/src/components/segments/HambergerMenu/HamburgerMenu'
import { useNavMenuContext } from '@/src/components/segments/NavBar/navMenuContext'
import { MenuSectionBase } from '@/src/components/segments/NavBar/useMenu'
import Brand from '@/src/components/simple-components/Brand'
import Button from '@/src/components/simple-components/Button'
import { MenuItemBase } from '@/src/components/simple-components/MenuDropdown/MenuDropdown'
import { StatusBar } from '@/src/components/simple-components/StatusBar'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  menuSections?: MenuSectionBase[]
  menuItems: MenuItemBase[]
  mobileNavbarRef: RefObject<HTMLDivElement | null>
}

export const MobileNavBar = ({ menuSections, menuItems, mobileNavbarRef }: Props) => {
  const { t } = useTranslation('account')
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
            <div className="flex h-16 w-full items-center border-b px-4 py-5">
              <div className="flex w-full justify-between">
                <Brand url={ROUTES.HOME} className="grow" />
                {isMobileMenuOpen ? (
                  <Button
                    onPress={() => {
                      setMobileMenuOpen(false)
                    }}
                    className="-mr-4 p-4"
                    aria-label={t('MobileNavBar.close')}
                    data-cy="mobile-account-button"
                    icon={<CrossIcon />}
                  />
                ) : (
                  <Button
                    onPress={() => {
                      setMobileMenuOpen(true)
                    }}
                    className="-mr-4 p-4"
                    aria-label={t('MobileNavBar.open')}
                    data-cy="mobile-account-button"
                    icon={<HamburgerIcon />}
                  />
                )}
              </div>

              {isMobileMenuOpen && (
                <HamburgerMenu
                  menuSections={menuSections}
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

import { Button } from '@bratislava/component-library'
import FocusTrap from 'focus-trap-react'
import { useTranslation } from 'next-i18next/pages'
import { RefObject } from 'react'

import Icon from '@/src/components/icon-components/Icon'
import MobileNavMenu from '@/src/components/segments/NavBar/MobileNavMenu'
import { useNavMenuContext } from '@/src/components/segments/NavBar/navMenuContext'
import { AlertBanner } from '@/src/components/simple-components/AlertBanner'
import Brand from '@/src/components/simple-components/Brand'
import cn from '@/src/utils/cn'

type Props = {
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  className?: string
}

export const MobileNavBar = ({ mobileNavbarRef, className }: Props) => {
  const { t } = useTranslation('account')
  const { isMobileMenuOpen, setMobileMenuOpen } = useNavMenuContext()

  return (
    <div id="mobile-navbar" className={className} ref={mobileNavbarRef}>
      <FocusTrap active={isMobileMenuOpen}>
        <div className="fixed top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background-passive-base px-4 text-content-passive-primary">
          <div className="flex w-full justify-between">
            <Brand className="grow" variant="header" />
            {isMobileMenuOpen ? (
              <Button
                onPress={() => {
                  setMobileMenuOpen(false)
                }}
                className="-mr-4 p-4 ring-inset"
                aria-label={t('MobileNavBar.close')}
                data-cy="mobile-account-button"
                icon={<Icon name="close" />}
              />
            ) : (
              <Button
                onPress={() => {
                  setMobileMenuOpen(true)
                }}
                className="-mr-4 p-4 ring-inset"
                aria-label={t('MobileNavBar.open')}
                data-cy="mobile-account-button"
                icon={<Icon name="menu-hamburger" />}
              />
            )}
          </div>

          {isMobileMenuOpen && <MobileNavMenu />}
        </div>
      </FocusTrap>
      {/* Empty div under header */}
      <div className={cn('h-14', className)} />

      <AlertBanner />
    </div>
  )
}

export default MobileNavBar

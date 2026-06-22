import { Button } from '@bratislava/component-library'
import FocusTrap from 'focus-trap-react'
import { useTranslation } from 'next-i18next/pages'
import { RefObject, useContext } from 'react'

import Icon from '@/src/components/icon-components/Icon'
import BackButton from '@/src/components/segments/NavBar/BackButton'
import MobileNavMenu from '@/src/components/segments/NavBar/MobileNavMenu'
import { useNavMenuContext } from '@/src/components/segments/NavBar/navMenuContext'
import OAuthLogo from '@/src/components/segments/OAuthLogo/OAuthLogo'
import { AlertBanner } from '@/src/components/simple-components/AlertBanner'
import Brand from '@/src/components/simple-components/Brand'
import { AmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import cn from '@/src/utils/cn'

type Props = {
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  variant?: 'default' | 'auth'
  hasBackButton?: boolean
  className?: string
}

export const MobileNavBar = ({
  mobileNavbarRef,
  variant,
  hasBackButton = false,
  className,
}: Props) => {
  const { t } = useTranslation('account')
  const { isMobileMenuOpen, setMobileMenuOpen } = useNavMenuContext()

  // Auth-variant pages are wrapped in AmplifyClientOAuthProvider; default pages are not, so read the
  // context optionally and treat its absence as a non-OAuth login.
  const isOAuthLogin = useContext(AmplifyClientOAuthContext)?.isOAuthLogin ?? false

  return (
    <div id="mobile-navbar" className={className} ref={mobileNavbarRef}>
      <FocusTrap active={isMobileMenuOpen}>
        <div className="fixed top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background-passive-base px-4 text-content-passive-primary">
          <div className="flex w-full justify-between">
            {hasBackButton && <BackButton />}
            <Brand className="grow" variant="header" unlinked={isOAuthLogin} />
            {variant === 'auth' ? (
              <OAuthLogo />
            ) : isMobileMenuOpen ? (
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

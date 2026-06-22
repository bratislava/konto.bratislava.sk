import { RefObject } from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import BackButton from '@/src/components/segments/NavBar/BackButton'
import OAuthLogo from '@/src/components/segments/OAuthLogo/OAuthLogo'
import { AlertBanner } from '@/src/components/simple-components/AlertBanner'
import Brand from '@/src/components/simple-components/Brand'
import { useAmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import cn from '@/src/utils/cn'

type Props = {
  backButtonHidden?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=fPsumQDg2MzoD5cz-4
 * TODO consider deleting this file and use NavBar instead
 */

export const AuthNavBar = ({
  className,
  backButtonHidden,
  desktopNavbarRef,
  mobileNavbarRef,
}: Props) => {
  const { isOAuthLogin } = useAmplifyClientOAuthContext()

  return (
    <div data-cy="navbar" className="contents">
      {/* Desktop */}
      <div className="hidden lg:block">
        <AlertBanner />
      </div>
      <div
        id="desktop-navbar"
        className={cn(
          'items-center max-lg:hidden',
          'sticky top-0 left-0 z-40 w-full bg-white shadow-default',
          className,
        )}
        ref={desktopNavbarRef}
      >
        <SectionContainer>
          <div className="flex h-[57px] w-full items-center justify-between">
            <div className="flex">
              {!backButtonHidden && <BackButton />}
              <Brand unlinked={isOAuthLogin} variant="header" />
            </div>
            <OAuthLogo />
          </div>
        </SectionContainer>
      </div>
      {/* Mobile */}
      <div
        id="mobile-navbar"
        className={cn(className, 'sticky top-0 left-0 z-40 w-full gap-x-6 bg-white lg:hidden')}
        ref={mobileNavbarRef}
      >
        <div className="flex h-16 w-full items-center justify-between border-b px-4">
          <div className="flex">
            {!backButtonHidden && <BackButton />}
            <Brand unlinked={isOAuthLogin} variant="header" />
          </div>
          <OAuthLogo />
        </div>
      </div>
      <div className="lg:hidden">
        <AlertBanner />
      </div>
    </div>
  )
}

export default AuthNavBar

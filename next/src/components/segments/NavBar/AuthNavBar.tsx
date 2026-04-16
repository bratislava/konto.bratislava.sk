import { Button } from '@bratislava/component-library'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { RefObject } from 'react'

import { ArrowLeftIcon } from '@/src/assets/ui-icons'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import OAuthLogo from '@/src/components/segments/OAuthLogo/OAuthLogo'
import Brand from '@/src/components/simple-components/Brand'
import { StatusBar } from '@/src/components/simple-components/StatusBar'
import { useAmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  backButtonHidden?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  className?: string
}

const BackButton = () => {
  const { t } = useTranslation('account')
  const router = useRouter()

  return (
    <>
      <Button
        variant="icon-wrapped-negative-margin"
        size="large"
        icon={<ArrowLeftIcon />}
        aria-label={t('BackButton.aria')}
        onPress={() => router.back()}
        className="max-lg:mx-1"
      />
      <div className="mx-6 h-6 border-r max-lg:hidden" aria-hidden />
    </>
  )
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
  const { t } = useTranslation('account')

  const { isOAuthLogin } = useAmplifyClientOAuthContext()

  const brandLinkHref = isOAuthLogin ? undefined : ROUTES.HOME

  return (
    <div data-cy="navbar" className="contents">
      {/* Desktop */}
      <div className="hidden lg:block">
        <StatusBar />
      </div>
      <div
        id="desktop-navbar"
        className={cn(
          'items-center text-p2 max-lg:hidden',
          'sticky top-0 left-0 z-40 w-full bg-white shadow-default',
          className,
        )}
        ref={desktopNavbarRef}
      >
        <SectionContainer>
          <div className="flex h-[57px] w-full items-center justify-between">
            <div className="flex">
              {!backButtonHidden && <BackButton />}
              <Brand
                className="group"
                url={brandLinkHref}
                title={
                  <p
                    className={cn('text-p2 text-font', {
                      'group-hover:text-gray-600': brandLinkHref,
                    })}
                  >
                    {t('NavBar.capitalCityOfSR')} <span className="font-semibold">Bratislava</span>
                  </p>
                }
              />
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
            <Brand
              url={brandLinkHref}
              title={
                <p
                  className={cn('text-p2 text-font', {
                    'group-hover:text-gray-600': brandLinkHref,
                  })}
                >
                  <span className="font-semibold">Bratislava</span>
                </p>
              }
            />
          </div>
          <OAuthLogo />
        </div>
      </div>
      <div className="lg:hidden">
        <StatusBar />
      </div>
    </div>
  )
}

export default AuthNavBar

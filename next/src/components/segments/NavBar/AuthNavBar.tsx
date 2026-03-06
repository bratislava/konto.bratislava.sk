import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { RefObject } from 'react'

import { ArrowLeftIcon } from '@/src/assets/ui-icons'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import OAuthLogo from '@/src/components/segments/OAuthLogo/OAuthLogo'
import Brand from '@/src/components/simple-components/Brand'
import { StatusBar } from '@/src/components/simple-components/StatusBar'
import { useAmplifyClientOAuthContext } from '@/src/frontend/hooks/useAmplifyClientOAuthContext'
import { getLanguageKey } from '@/src/frontend/utils/general'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  currentLanguage?: string
  backButtonHidden?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  className?: string
}

const BackButton = () => {
  const router = useRouter()

  return (
    <>
      {/* FIXME we should use Button */}
      <ArrowLeftIcon className="mx-1 cursor-pointer" onClick={() => router.back()} />
      <div className="border-b-solid mx-6 hidden h-6 border-r-2 lg:flex" />
    </>
  )
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=fPsumQDg2MzoD5cz-4
 * TODO consider deleting this file and use NavBar instead
 */

export const AuthNavBar = ({
  className,
  currentLanguage = 'sk',
  backButtonHidden,
  desktopNavbarRef,
  mobileNavbarRef,
}: Props) => {
  const { t } = useTranslation('account')
  const languageKey = getLanguageKey(currentLanguage)

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
        <SectionContainer className="h-[57px]">
          <div className="flex w-full items-center justify-between">
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
                    {languageKey === 'en' && <span className="font-semibold">Bratislava </span>}
                    {t('NavBar.capitalCityOfSR')}
                    {languageKey !== 'en' && <span className="font-semibold"> Bratislava</span>}
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
        <div className="flex h-16 w-full items-center justify-between border-b-2 px-4">
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

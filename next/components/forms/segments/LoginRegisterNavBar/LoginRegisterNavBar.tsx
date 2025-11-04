import { ArrowLeftIcon } from '@assets/ui-icons'
import { StatusBar } from 'components/forms/info-components/StatusBar'
import Brand from 'components/forms/simple-components/Brand'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { RefObject } from 'react'

import cn from '../../../../frontend/cn'
import { useOAuthParams } from '../../../../frontend/hooks/useOAuthParams'
import { getLanguageKey } from '../../../../frontend/utils/general'

interface LoginRegisterNavBarProps {
  className?: string
  currentLanguage?: string
  backButtonHidden?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
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

// TODO consider deleting this file and use NavBar instead
export const LoginRegisterNavBar = ({
  className,
  currentLanguage = 'sk',
  backButtonHidden,
  desktopNavbarRef,
  mobileNavbarRef,
}: LoginRegisterNavBarProps) => {
  const { t } = useTranslation('account')
  const languageKey = getLanguageKey(currentLanguage)

  const { isOAuthLogin } = useOAuthParams()

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
          'items-center text-p2',
          'sticky top-0 left-0 z-40 w-full bg-white shadow-default',
          className,
        )}
        ref={desktopNavbarRef}
      >
        <div className="m-auto hidden h-[57px] w-full max-w-(--breakpoint-lg) items-center lg:flex">
          {!backButtonHidden && <BackButton />}
          <Brand
            className="group"
            url={brandLinkHref}
            title={
              <p
                className={cn('text-p2 text-font', { 'group-hover:text-gray-600': brandLinkHref })}
              >
                {languageKey === 'en' && <span className="font-semibold">Bratislava </span>}
                {t('common:capitalCity')}
                {languageKey !== 'en' && <span className="font-semibold"> Bratislava</span>}
              </p>
            }
          />
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-navbar"
        className={cn(className, 'sticky top-0 left-0 z-40 w-full gap-x-6 bg-white lg:hidden')}
        ref={mobileNavbarRef}
      >
        <div className="flex h-16 items-center border-b-2 px-8 py-5">
          {!backButtonHidden && <BackButton />}
          <Brand
            url={brandLinkHref}
            className="mx-auto"
            title={
              <p
                className={cn('text-p2 text-font', { 'group-hover:text-gray-600': brandLinkHref })}
              >
                <span className="font-semibold">Bratislava</span>
              </p>
            }
          />
        </div>
      </div>
      <div className="lg:hidden">
        <StatusBar />
      </div>
    </div>
  )
}

export default LoginRegisterNavBar

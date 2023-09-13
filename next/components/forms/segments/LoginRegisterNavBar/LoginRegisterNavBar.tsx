import { ArrowLeftIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { StatusBar, useStatusBarContext } from 'components/forms/info-components/StatusBar'
import Brand from 'components/forms/simple-components/Brand'
import { ROUTES } from 'frontend/api/constants'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import useElementSize from '../../../../frontend/hooks/useElementSize'
import { getLanguageKey } from '../../../../frontend/utils/general'

interface IProps {
  className?: string
  currentLanguage?: string
  backButtonHidden?: boolean
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

export const LoginRegisterNavBar = ({ className, currentLanguage, backButtonHidden }: IProps) => {
  const languageKey = getLanguageKey(currentLanguage)

  const { statusBarConfiguration } = useStatusBarContext()
  const [desktopRef, { height: desktopHeight }] = useElementSize([statusBarConfiguration.content])
  const [mobileRef, { height: mobileHeight }] = useElementSize([statusBarConfiguration.content])

  const { t } = useTranslation('account')
  return (
    <div style={{ marginBottom: Math.max(desktopHeight, mobileHeight) }}>
      {/* Desktop */}
      <div
        id="desktop-navbar"
        className={cx(
          className,
          'text-p2 items-center',
          'fixed left-0 top-0 z-40 w-full bg-white shadow',
        )}
        ref={desktopRef}
      >
        <StatusBar className="hidden lg:flex" />
        <div className="m-auto hidden h-[57px] w-full max-w-screen-lg items-center lg:flex">
          {!backButtonHidden && <BackButton />}
          <Brand
            className="group"
            url={ROUTES.HOME}
            title={
              <p className="text-p2 text-font group-hover:text-gray-600">
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
        className={cx(className, 'fixed left-0 top-0 z-40 w-full gap-x-6 bg-white lg:hidden')}
        ref={mobileRef}
      >
        <StatusBar className="flex lg:hidden" />
        <div className="flex h-16 items-center border-b-2 px-8 py-5">
          {!backButtonHidden && <BackButton />}
          <Brand
            url={ROUTES.HOME}
            className="mx-auto"
            title={
              <p className="text-p2 text-font group-hover:text-gray-600">
                <span className="font-semibold">Bratislava</span>
              </p>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default LoginRegisterNavBar

import { ArrowLeft } from '@assets/images'
import { getLanguageKey } from '@utils/utils'
import cx from 'classnames'
import Brand from 'components/forms/simple-components/Brand'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { StatusBar } from 'components/forms/info-components/StatusBar'
import { useElementSize } from 'usehooks-ts'

interface IProps {
  className?: string
  currentLanguage?: string
  backButtonHidden?: boolean
}

const BackButton = () => {
  const router = useRouter()

  return (
    <>
      <ArrowLeft className="cursor-pointer mx-1" onClick={() => router.back()} />
      <div className="border-b-solid border-r-2 h-6 mx-6 hidden lg:flex" />
    </>
  )
}

export const LoginRegisterNavBar = ({ className, currentLanguage, backButtonHidden }: IProps) => {
  const languageKey = getLanguageKey(currentLanguage)
  const [desktopRef, { height: desktopHeight }] = useElementSize()
  const [mobileRef, { height: mobileHeight }] = useElementSize()

  const { t } = useTranslation('account')
  return (
    <div style={{ marginBottom: Math.max(desktopHeight, mobileHeight) }}>
      {/* Desktop */}
      <div
        id="desktop-navbar"
        className={cx(
          className,
          'text-p2 items-center',
          'fixed top-0 left-0 w-full bg-white z-40 shadow',
        )}
        ref={desktopRef}
      >
        <StatusBar className="hidden lg:flex" />
        <div className="max-w-screen-lg m-auto hidden h-[57px] w-full items-center lg:flex">
          {!backButtonHidden && <BackButton />}
          <Brand
            className="group"
            url="/"
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
        className={cx(className, 'lg:hidden fixed top-0 left-0 w-full bg-white z-40 gap-x-6')}
        ref={mobileRef}
      >
        <StatusBar className="flex lg:hidden" />
        <div className="h-16 flex items-center py-5 px-8 border-b-2">
          {!backButtonHidden && <BackButton />}
          <Brand
            url="/"
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

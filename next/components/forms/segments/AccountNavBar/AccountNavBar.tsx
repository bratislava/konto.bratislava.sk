import ChevronDownSmall from '@assets/images/new-icons/ui/arrow-small-down.svg'
import HamburgerClose from '@assets/images/new-icons/ui/cross.svg'
import Hamburger from '@assets/images/new-icons/ui/hamburger.svg'
import ProfileOutlinedIcon from '@assets/images/new-icons/ui/profile.svg'
import cx from 'classnames'
import { StatusBar, useStatusBarContext } from 'components/forms/info-components/StatusBar'
import HamburgerMenu from 'components/forms/segments/HambergerMenu/HamburgerMenu'
import Button from 'components/forms/simple-components/Button'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'
import { RemoveScroll } from 'react-remove-scroll'

import { ROUTES } from '../../../../frontend/api/constants'
import useAccount, { UserData } from '../../../../frontend/hooks/useAccount'
import useElementSize from '../../../../frontend/hooks/useElementSize'
import Brand from '../../simple-components/Brand'
import Link from './NavBarLink'

interface IProps extends LanguageSelectProps {
  className?: string
  navHidden?: boolean
  sectionsList?: MenuSectionItemBase[]
  menuItems: MenuItemBase[]
  hiddenHeaderNav?: boolean
}

interface LanguageSelectProps {
  className?: string
  languages?: LanguageOption[]
  currentLanguage?: string
  onLanguageChange?: (language: LanguageOption) => void
}

interface LanguageOption {
  key: string
  title: string
}

export interface MenuSectionItemBase {
  id: number
  title: string
  icon: ReactNode
  url: string
}

const Avatar = ({ userData }: { userData?: UserData | null }) => {
  return (
    <div className="flex relative flex-row items-start gap-2 rounded-full p-2 bg-main-100">
      <div className="flex h-6 w-6 items-center justify-center font-semibold text-main-700">
        <span className="uppercase">
          {userData && userData.given_name && userData.family_name ? (
            userData.given_name[0] + userData.family_name[0]
          ) : (
            <ProfileOutlinedIcon className="w-6 h-6 text-main-700" />
          )}
        </span>
      </div>
    </div>
  )
}

export const AccountNavBar = ({ className, sectionsList, menuItems, hiddenHeaderNav }: IProps) => {
  const [burgerOpen, setBurgerOpen] = useState(false)
  const { isAuth, userData } = useAccount()

  const { statusBarContent } = useStatusBarContext()
  const [desktopRef, { height: desktopHeight }] = useElementSize([statusBarContent])
  const [mobileRef, { height: mobileHeight }] = useElementSize([statusBarContent])

  const { t } = useTranslation(['common', 'account'])
  const router = useRouter()

  const isActive = (sectionItem: MenuSectionItemBase) =>
    sectionItem.url === '/' ? router.pathname === '/' : router.pathname.startsWith(sectionItem.url)

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
        <div className={RemoveScroll.classNames.fullWidth}>
          <StatusBar className="hidden lg:flex" />
          <div
            className={cx('max-w-screen-lg m-auto hidden h-[57px] items-center lg:flex gap-x-6')}
          >
            <Brand
              className="group grow"
              url="https://bratislava.sk/"
              title={
                <p className="text-p2 text-font group-hover:text-gray-600">
                  {t('common:capitalCity')}
                  <span className="font-semibold"> Bratislava</span>
                </p>
              }
            />
            <IdentityVerificationStatus />
            <nav className="text-font/75 flex gap-x-8 font-semibold">
              <div className="text-font/75 flex items-center gap-x-6 font-semibold">
                {isAuth ? (
                  <MenuDropdown
                    buttonTrigger={
                      <>
                        <Avatar userData={userData} />
                        <div className="ml-3 font-light lg:font-semibold">
                          {userData?.given_name}
                        </div>
                        <ChevronDownSmall
                          className={`ml-1 hidden w-5 h-5 mix-blend-normal lg:flex ${
                            true ? '-rotate-180' : ''
                          }`}
                        />
                      </>
                    }
                    itemVariant="header"
                    items={menuItems}
                  />
                ) : (
                  <>
                    <Link
                      href={ROUTES.LOGIN}
                      variant="plain"
                      className="whitespace-nowrap py-4 ml-2"
                    >
                      {t('account:menu_login_link')}
                    </Link>
                    <Button
                      onPress={() => router.push(ROUTES.REGISTER)}
                      variant="negative"
                      text={t('account:menu_register_link')}
                      size="sm"
                    />
                  </>
                )}
              </div>
            </nav>
          </div>
          {/* Header bottom navigation */}
          {isAuth && sectionsList && !hiddenHeaderNav && (
            <div className="hidden border-t border-gray-200 max-w-screen-lg m-auto h-[57px] w-full items-center justify-between lg:flex">
              <ul className="w-full h-full flex items-center">
                {sectionsList.map((sectionItem) => (
                  <li className="w-full h-full" key={sectionItem.id}>
                    <NextLink href={sectionItem.url}>
                      <div
                        className={cx(
                          'text-p2-semibold w-full h-full flex items-center justify-center cursor-pointer border-b-2 hover:text-main-700 hover:border-main-700 transition-all',
                          {
                            'text-main-700 border-main-700': isActive(sectionItem),
                            'border-transparent': !isActive(sectionItem),
                          },
                        )}
                      >
                        {sectionItem.icon}
                        <span className="ml-3">{t(sectionItem?.title)}</span>
                      </div>
                    </NextLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Mobile */}
      <div
        id="mobile-navbar"
        className={cx(className, 'lg:hidden fixed top-0 left-0 w-full bg-white z-40 gap-x-6')}
        ref={mobileRef}
      >
        <div className={RemoveScroll.classNames.fullWidth}>
          {!burgerOpen && <StatusBar className="flex lg:hidden" />}
          <div className="h-16 flex items-center py-5 px-8 border-b-2">
            <Brand url="https://bratislava.sk/" className="grow" />
            <button
              type="button"
              onClick={() => (isAuth ? setBurgerOpen(!burgerOpen) : router.push(ROUTES.LOGIN))}
              className="-mr-4 px-4 py-5"
            >
              <div className="flex w-6 items-center justify-center">
                {burgerOpen ? (
                  <HamburgerClose className="w-6 h-6" />
                ) : isAuth && sectionsList ? (
                  <Hamburger />
                ) : (
                  <Avatar userData={userData} />
                )}
              </div>
            </button>

            {burgerOpen && (
              <HamburgerMenu
                sectionsList={sectionsList}
                menuItems={menuItems}
                closeMenu={() => setBurgerOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountNavBar

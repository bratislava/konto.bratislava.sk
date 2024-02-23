import { ChevronDownSmallIcon, ProfileIcon } from '@assets/ui-icons'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import cx from 'classnames'
import { StatusBar } from 'components/forms/info-components/StatusBar'
import Button from 'components/forms/simple-components/Button'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useConditionalFormRedirects } from 'components/forms/useFormRedirects'
import { UserData } from 'frontend/dtos/accountDto'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, useState } from 'react'
import { RemoveScroll } from 'react-remove-scroll'

import { ROUTES } from '../../../../frontend/api/constants'
import useElementSize from '../../../../frontend/hooks/useElementSize'
import Brand from '../../simple-components/Brand'
import { MobileNavBar } from './MobileNavBar'
import { useNavMenuContext } from './navMenuContext'

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
    <div className="relative flex flex-row items-start gap-2 rounded-full bg-main-100 p-2">
      <div className="flex h-6 w-6 items-center justify-center font-semibold text-main-700">
        <span className="uppercase">
          {userData && userData.given_name && userData.family_name ? (
            userData.given_name[0] + userData.family_name[0]
          ) : (
            <ProfileIcon className="h-6 w-6 text-main-700" />
          )}
        </span>
      </div>
    </div>
  )
}

export const NavBar = ({ className, sectionsList, menuItems, hiddenHeaderNav }: IProps) => {
  const { userData, isAuthenticated, isLegalEntity } = useServerSideAuth()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const { menuValue, setMenuValue } = useNavMenuContext()
  const [alertRef, { height }] = useElementSize<HTMLDivElement>()

  const { t } = useTranslation(['common', 'account'])
  const router = useRouter()

  // we need to keep the work in progress of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()
  const login = () =>
    optionalFormRedirectsContext ? optionalFormRedirectsContext.login() : router.push(ROUTES.LOGIN)
  const register = () =>
    optionalFormRedirectsContext
      ? optionalFormRedirectsContext.register()
      : router.push(ROUTES.REGISTER)

  const isActive = (sectionItem: MenuSectionItemBase) =>
    sectionItem.url === '/' ? router.pathname === '/' : router.pathname.startsWith(sectionItem.url)
  return (
    <>
      {/* Desktop */}
      <div
        id="desktop-navbar"
        className={cx(
          className,
          'text-p2 hidden items-center lg:block',
          'fixed left-0 top-0 z-40 w-full bg-white shadow',
        )}
      >
        <div className={RemoveScroll.classNames.fullWidth}>
          <StatusBar ref={alertRef} />
          <div
            className={cx('m-auto hidden h-[57px] max-w-screen-lg items-center gap-x-6 lg:flex')}
          >
            <Brand
              className="group grow"
              url={ROUTES.HOME}
              title={
                <p className="text-p2 text-font group-hover:text-gray-600">
                  {t('common:capitalCity')}
                  <span className="font-semibold"> Bratislava</span>
                </p>
              }
            />
            <IdentityVerificationStatus />
            <nav className="flex gap-x-8 font-semibold text-font/75">
              {isAuthenticated ? (
                <MenuDropdown
                  setIsOpen={setIsMenuOpen}
                  buttonTrigger={
                    <ButtonNew
                      variant="unstyled"
                      data-cy="account-button"
                      className="flex items-center gap-4 font-semibold text-font/75"
                    >
                      <Avatar userData={userData} />
                      <div className="flex items-center gap-1 font-light lg:font-semibold">
                        {isLegalEntity ? userData?.name : userData?.given_name}
                        <ChevronDownSmallIcon
                          className={`hidden h-5 w-5 mix-blend-normal lg:flex ${
                            isMenuOpen ? '-rotate-180' : ''
                          }`}
                        />
                      </div>
                    </ButtonNew>
                  }
                  itemVariant="header"
                  items={menuItems}
                />
              ) : (
                <div className="flex items-center gap-x-6 font-semibold text-font/75">
                  <Button
                    className="whitespace-nowrap lg:flex"
                    size="sm"
                    onPress={login}
                    variant="plain-black"
                    text={t('account:menu_login_link')}
                    data-cy="login-button"
                  />
                  <Button
                    onPress={register}
                    variant="negative"
                    text={t('account:menu_register_link')}
                    size="sm"
                    data-cy="register-button"
                  />
                </div>
              )}
            </nav>
          </div>
          {/* Header bottom navigation */}
          {sectionsList && !hiddenHeaderNav && (
            <div className="m-auto hidden h-[57px] w-full max-w-screen-lg items-center justify-between border-t border-gray-200 lg:flex">
              <NavigationMenu.Root
                value={menuValue}
                onValueChange={setMenuValue}
                aria-label={t('NavMenu.aria.navMenuLabel')}
                // because of this https://github.com/radix-ui/primitives/discussions/1874 we can't directly access subelement (<div style="position: relative;")
                // of "<nav>" element that NavigationMenu.List creates when used. Solution is to add grid class to the parent element.
                className="grid h-full w-full"
              >
                <NavigationMenu.List className="flex h-full w-full items-center">
                  {sectionsList.map((sectionItem) => (
                    <NavigationMenu.Item key={sectionItem.id} className="h-full w-full">
                      <NavigationMenu.Link asChild>
                        <NextLink href={sectionItem.url}>
                          <div
                            className={cx(
                              'text-p2-semibold flex h-full w-full cursor-pointer items-center justify-center border-b-2 transition-all hover:border-main-700 hover:text-main-700',
                              {
                                'border-main-700 text-main-700': isActive(sectionItem),
                                'border-transparent': !isActive(sectionItem),
                              },
                            )}
                          >
                            {sectionItem.icon}
                            <span className="ml-3">{t(sectionItem?.title)}</span>
                          </div>
                        </NextLink>
                      </NavigationMenu.Link>
                    </NavigationMenu.Item>
                  ))}
                </NavigationMenu.List>
              </NavigationMenu.Root>
            </div>
          )}
        </div>
      </div>
      <div style={{ height }} aria-hidden className="hidden lg:block" />
      <div className="hidden h-[114px] lg:block" aria-hidden />
      {/* Mobile */}
      <MobileNavBar className="lg:hidden" menuItems={menuItems} sectionsList={sectionsList} />
    </>
  )
}

export default NavBar

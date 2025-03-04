import { ChevronDownSmallIcon, ProfileIcon } from '@assets/ui-icons'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import cx from 'classnames'
import Button from 'components/forms/simple-components/Button'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import MenuDropdown, {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { useConditionalFormRedirects } from 'components/forms/useFormRedirects'
import { UserAttributes } from 'frontend/dtos/accountDto'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactNode, RefObject, useState } from 'react'

import { ROUTES } from '../../../../frontend/api/constants'
import { useQueryParamRedirect } from '../../../../frontend/hooks/useQueryParamRedirect'
import { useSsrAuth } from '../../../../frontend/hooks/useSsrAuth'
import { StatusBar } from '../../info-components/StatusBar'
import Brand from '../../simple-components/Brand'
import { MobileNavBar } from './MobileNavBar'
import { useNavMenuContext } from './navMenuContext'

interface IProps extends LanguageSelectProps {
  className?: string
  navHidden?: boolean
  sectionsList?: MenuSectionItemBase[]
  menuItems: MenuItemBase[]
  hiddenHeaderNav?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
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

const Avatar = ({ userAttributes }: { userAttributes?: UserAttributes | null }) => {
  return (
    <div className="bg-main-100 relative flex flex-row items-start gap-2 rounded-full p-2">
      <div className="text-main-700 flex size-6 items-center justify-center font-semibold">
        <span className="uppercase">
          {userAttributes && userAttributes.given_name && userAttributes.family_name ? (
            userAttributes.given_name[0] + userAttributes.family_name[0]
          ) : (
            <ProfileIcon className="text-main-700 size-6" />
          )}
        </span>
      </div>
    </div>
  )
}

export const NavBar = ({
  className,
  sectionsList,
  menuItems,
  hiddenHeaderNav,
  desktopNavbarRef,
  mobileNavbarRef,
}: IProps) => {
  const { getRouteWithCurrentUrlRedirect } = useQueryParamRedirect()
  const { userAttributes, isSignedIn, isLegalEntity } = useSsrAuth()

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const { menuValue, setMenuValue } = useNavMenuContext()

  const { t } = useTranslation(['common', 'account'])
  const router = useRouter()

  // we need to keep the work in progress of the open form if navigating away form it
  const optionalFormRedirectsContext = useConditionalFormRedirects()
  const login = () =>
    optionalFormRedirectsContext
      ? optionalFormRedirectsContext.login()
      : router.push(getRouteWithCurrentUrlRedirect(ROUTES.LOGIN))
  const register = () =>
    optionalFormRedirectsContext
      ? optionalFormRedirectsContext.register()
      : router.push(getRouteWithCurrentUrlRedirect(ROUTES.REGISTER))

  const isActive = (sectionItem: MenuSectionItemBase) =>
    sectionItem.url === '/' ? router.pathname === '/' : router.pathname.startsWith(sectionItem.url)
  return (
    <>
      <div className="hidden lg:block">
        <StatusBar />
      </div>
      {/* Desktop */}
      <div
        id="desktop-navbar"
        className={cx(
          className,
          'text-p2 shadow-default sticky top-0 left-0 z-40 hidden w-full items-center bg-white lg:block',
        )}
        ref={desktopNavbarRef}
      >
        <div className="m-auto hidden h-[57px] max-w-(--breakpoint-lg) items-center gap-x-6 lg:flex">
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
          <nav className="text-font/75 flex gap-x-8 font-semibold">
            {isSignedIn ? (
              <MenuDropdown
                setIsOpen={setIsMenuOpen}
                buttonTrigger={
                  <ButtonNew
                    variant="unstyled"
                    data-cy="account-button"
                    className="text-font/75 flex items-center gap-4 font-semibold"
                  >
                    <Avatar userAttributes={userAttributes} />
                    <div className="flex items-center gap-1 font-light lg:font-semibold">
                      {isLegalEntity ? userAttributes?.name : userAttributes?.given_name}
                      <ChevronDownSmallIcon
                        className={`hidden size-5 mix-blend-normal lg:flex ${
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
              <div className="text-font/75 flex items-center gap-x-6 font-semibold">
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
          <div className="m-auto hidden h-[57px] w-full max-w-(--breakpoint-lg) items-center justify-between border-t border-gray-200 lg:flex">
            <NavigationMenu.Root
              value={menuValue}
              onValueChange={setMenuValue}
              aria-label={t('NavMenu.aria.navMenuLabel')}
              // because of this https://github.com/radix-ui/primitives/discussions/1874 we can't directly access subelement (<div style="position: relative;")
              // of "<nav>" element that NavigationMenu.List creates when used. Solution is to add grid class to the parent element.
              className="grid size-full"
            >
              <NavigationMenu.List className="flex size-full items-center">
                {sectionsList.map((sectionItem) => (
                  <NavigationMenu.Item key={sectionItem.id} className="size-full">
                    <NavigationMenu.Link asChild>
                      <NextLink href={sectionItem.url}>
                        <div
                          className={cx(
                            'text-p2-semibold hover:border-main-700 hover:text-main-700 flex h-full w-full cursor-pointer items-center justify-center border-b-2 transition-all',
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
      {/* Mobile */}
      <MobileNavBar
        menuItems={menuItems}
        sectionsList={sectionsList}
        mobileNavbarRef={mobileNavbarRef}
      />
    </>
  )
}

export default NavBar

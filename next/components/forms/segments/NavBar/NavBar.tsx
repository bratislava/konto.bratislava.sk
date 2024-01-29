import { ChevronDownSmallIcon, CrossIcon, HamburgerIcon, ProfileIcon } from '@assets/ui-icons'
import cx from 'classnames'
import { StatusBar, useStatusBarContext } from 'components/forms/info-components/StatusBar'
import HamburgerMenu from 'components/forms/segments/HambergerMenu/HamburgerMenu'
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
import { ReactNode, useEffect, useRef, useState } from 'react'
import { RemoveScroll } from 'react-remove-scroll'

import { ROUTES } from '../../../../frontend/api/constants'
import useElementSize from '../../../../frontend/hooks/useElementSize'
import Brand from '../../simple-components/Brand'

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

// TODO - needs complete refactor using some accessibility library
export const NavBar = ({ className, sectionsList, menuItems, hiddenHeaderNav }: IProps) => {
  const [burgerOpen, setBurgerOpen] = useState(false)
  const { userData, isAuthenticated, isLegalEntity } = useServerSideAuth()

  const { statusBarConfiguration } = useStatusBarContext()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [desktopRef, { height: desktopHeight }] = useElementSize([statusBarConfiguration.content])
  const [mobileRef, { height: mobileHeight }] = useElementSize([statusBarConfiguration.content])

  const { t } = useTranslation(['common', 'account'])
  const router = useRouter()

  /**  Reference to the navigation container element and state to track if navigation is focused  */
  const navigationRef = useRef<HTMLDivElement>(null)
  const [isNavigationFocused, setIsNavigationFocused] = useState(false)

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

  // TODO - this behaviour should be handled by accessibility library. Keeping for now, because it's better than nothing.
  useEffect(() => {
    /** Allow navigating nav menu with keyboard arrows when it gets focused */
    const handleKeyDown = (event: KeyboardEvent) => {
      /** Check if the navigation is currently focused */
      if (isNavigationFocused) {
        /** Get all li elements within the navigationRef or an empty array if it's not available */
        const allLiElements = Array.from(navigationRef.current?.querySelectorAll('li') ?? [])
        /** Get the currently active element as an HTMLLIElement */
        const currentActiveElement = document.activeElement as HTMLLIElement
        /** Find the index of the currently active element within the list of all li elements */
        const currentIndex = allLiElements.findIndex((li) => li.contains(currentActiveElement))

        if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
          event.preventDefault()
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : allLiElements.length - 1
          allLiElements[prevIndex]?.querySelector('a')?.focus()
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
          event.preventDefault()
          const nextIndex = currentIndex < allLiElements.length - 1 ? currentIndex + 1 : 0
          allLiElements[nextIndex]?.querySelector('a')?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNavigationFocused])

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
        <div className={RemoveScroll.classNames.fullWidth}>
          <StatusBar className="hidden lg:flex" />
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
            <div
              className="m-auto hidden h-[57px] w-full max-w-screen-lg items-center justify-between border-t border-gray-200 lg:flex"
              ref={navigationRef}
            >
              <ul className="flex h-full w-full items-center">
                {sectionsList.map((sectionItem) => (
                  <li
                    className="h-full w-full"
                    key={sectionItem.id}
                    onFocus={() => setIsNavigationFocused(true)}
                    onBlur={() => setIsNavigationFocused(false)}
                  >
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
        className={cx(className, 'fixed left-0 top-0 z-40 w-full gap-x-6 bg-white lg:hidden')}
        ref={mobileRef}
      >
        <div className={RemoveScroll.classNames.fullWidth}>
          {!burgerOpen && <StatusBar className="flex lg:hidden" />}
          <div className="flex h-16 items-center border-b-2 px-8 py-5">
            <Brand url={ROUTES.HOME} className="grow" />
            {/* event onPress is propagating to menu itself casuing glitches when opening mobile menu, 
            becasue of that we are using onClick event and thats why simple button is used */}
            <button
              type="button"
              onClick={() => (isAuthenticated ? setBurgerOpen(!burgerOpen) : login())}
              className="-mr-4 px-4 py-5"
              data-cy="mobile-account-button"
            >
              <div className="flex w-6 items-center justify-center">
                {burgerOpen ? (
                  <CrossIcon className="h-6 w-6" />
                ) : isAuthenticated && sectionsList ? (
                  <HamburgerIcon />
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

export default NavBar

import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import cx from 'classnames'
import { MenuSectionItemBase } from 'components/forms/segments/NavBar/NavBar'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import logger from 'frontend/utils/logger'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, forwardRef } from 'react'
import { useEventListener, useLockedBody } from 'usehooks-ts'

import { ROUTES } from '../../../../frontend/api/constants'
import { useNavMenuContext } from '../NavBar/navMenuContext'

interface IProps {
  sectionsList?: MenuSectionItemBase[]
  menuItems: MenuItemBase[]
  closeMenu: () => void
}

const Divider = () => {
  return <div className="border-b-solid my-4 border-b-2" />
}

export type ItemLinkProps = Omit<ComponentProps<typeof Link>, 'as' | 'passHref' | 'href'> & {
  menuItem: MenuItemBase
  isSelected?: boolean
  onClick: () => void
}

const ItemLink = forwardRef<HTMLAnchorElement, ItemLinkProps>(
  ({ menuItem, isSelected, onClick, ...rest }, ref) => {
    const { t } = useTranslation()

    return menuItem.url ? (
      <Link
        href={menuItem.url}
        // without ref, you can't navigate using arrow keys
        ref={ref}
        // without ...rest, you can't navigate using arrow keys
        {...rest}
        onClick={onClick}
        className={cx(
          'text-p2-semibold flex cursor-pointer items-center gap-3 rounded-lg border-b-2 border-transparent p-4 transition-all hover:bg-main-100 hover:text-main-700',
          {
            'bg-main-100 text-main-700': isSelected,
          },
        )}
        data-cy={`${menuItem.url.replaceAll('/', '')}-menu-item`}
      >
        <div aria-hidden>{menuItem.icon}</div>
        <span>{t(menuItem?.title)}</span>
        {menuItem.url === ROUTES.USER_PROFILE && <IdentityVerificationStatus />}
      </Link>
    ) : null
  },
)

export const HamburgerMenu = ({ sectionsList, menuItems, closeMenu }: IProps) => {
  const router = useRouter()
  const { menuValue, setMenuValue, setMobileMenuOpen, isMobileMenuOpen } = useNavMenuContext()
  const { t } = useTranslation('common')

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenuOpen(false)
    }
  })

  // used to lock body with overflow: hidden when mobile menu is open, look for div with id="root" in _app.tsx
  useLockedBody(isMobileMenuOpen, 'root')

  return (
    <div
      className={cx(
        'fixed left-0 top-16 flex w-screen flex-col overflow-y-scroll bg-white p-4 lg:hidden',
      )}
      style={{ height: 'calc(100vh - 60px)' }}
    >
      <NavigationMenu.Root
        value={menuValue}
        onValueChange={setMenuValue}
        aria-label={t('NavMenu.aria.navMenuLabel')}
      >
        <NavigationMenu.List className="flex flex-col">
          {sectionsList && (
            <>
              {sectionsList.map((sectionItem) => (
                <NavigationMenu.Item key={sectionItem.id}>
                  <NavigationMenu.Link asChild onClick={closeMenu}>
                    <ItemLink
                      menuItem={sectionItem}
                      isSelected={router.route.endsWith(sectionItem?.url)}
                      onClick={closeMenu}
                    />
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              ))}
              <li aria-hidden>
                <Divider />
              </li>
            </>
          )}
          {menuItems.map((sectionItem) => {
            // TODO clean up this logic & move menu items closer to where they are used
            if (sectionItem.onPress) {
              return (
                <NavigationMenu.Item key={sectionItem.id}>
                  <NavigationMenu.Trigger
                    className={cx(
                      'text-p2-semibold flex w-full cursor-pointer items-center justify-between rounded-lg border-b-2 border-transparent p-4 transition-all hover:bg-main-100 hover:text-main-700',
                    )}
                    data-cy={`${sectionItem.url ? sectionItem.url.replaceAll('/', '') : sectionItem.title.replaceAll(' ', '-')}-menu-item`}
                    onClick={() => {
                      if (sectionItem.onPress) {
                        sectionItem.onPress()?.catch((error) => logger.error(error))
                        closeMenu()
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {sectionItem.icon}
                      <span>{t(sectionItem?.title)}</span>
                    </div>
                    {sectionItem.url === ROUTES.USER_PROFILE && <IdentityVerificationStatus />}
                  </NavigationMenu.Trigger>
                </NavigationMenu.Item>
              )
            }
            return sectionItem.url ? (
              <NavigationMenu.Item key={sectionItem.id}>
                <NavigationMenu.Link asChild onClick={closeMenu}>
                  <ItemLink menuItem={sectionItem} onClick={closeMenu} />
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ) : null
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  )
}

export default HamburgerMenu

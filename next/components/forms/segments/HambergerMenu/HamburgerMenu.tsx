import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import HorizontalDivider from 'components/forms/HorizontalDivider'
import { useNavMenuContext } from 'components/forms/segments/NavBar/navMenuContext'
import { MenuSectionBase } from 'components/forms/segments/NavBar/useMenu'
import IdentityVerificationStatus from 'components/forms/simple-components/IdentityVerificationStatus'
import { MenuItemBase } from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import { ROUTES } from 'frontend/api/constants'
import cn from 'frontend/cn'
import logger from 'frontend/utils/logger'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, forwardRef } from 'react'
import { useEventListener, useScrollLock } from 'usehooks-ts'


type Props = {
  sectionsList?: MenuSectionBase[]
  menuItems: MenuItemBase[]
  closeMenu: () => void
}

type ItemLinkProps = Omit<ComponentProps<typeof Link>, 'as' | 'passHref' | 'href'> & {
  menuItem: MenuItemBase
  isSelected?: boolean
  onClick: () => void
}

const ItemLink = forwardRef<HTMLAnchorElement, ItemLinkProps>(
  ({ menuItem, isSelected, onClick, ...rest }, ref) => {
    return menuItem.url ? (
      <Link
        href={menuItem.url}
        // without ref, you can't navigate using arrow keys
        ref={ref}
        // without ...rest, you can't navigate using arrow keys
        {...rest}
        onClick={onClick}
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-lg border-b-2 border-transparent p-4 text-p2-semibold transition-all hover:bg-main-100 hover:text-main-700',
          {
            'bg-main-100 text-main-700': isSelected,
          },
        )}
        data-cy={`${menuItem.url.replaceAll('/', '')}-menu-item`}
      >
        <div aria-hidden>{menuItem.icon}</div>
        <span>{menuItem.title}</span>
        {menuItem.url === ROUTES.USER_PROFILE && <IdentityVerificationStatus />}
      </Link>
    ) : null
  },
)

export const HamburgerMenu = ({ sectionsList, menuItems, closeMenu }: Props) => {
  const router = useRouter()
  const { menuValue, setMenuValue, setMobileMenuOpen } = useNavMenuContext()
  const { t } = useTranslation('account')

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenuOpen(false)
    }
  })

  useScrollLock()

  return (
    <div
      className={cn(
        'fixed top-16 left-0 flex w-screen flex-col overflow-y-scroll bg-white p-4 lg:hidden',
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
              <HorizontalDivider asListItem className='my-4 border-b-2' />
            </>
          )}
          {menuItems.map((sectionItem) => {
            // TODO clean up this logic & move menu items closer to where they are used
            if (sectionItem.onPress) {
              return (
                <NavigationMenu.Item key={sectionItem.id}>
                  <NavigationMenu.Trigger
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between rounded-lg border-b-2 border-transparent p-4 text-p2-semibold transition-all hover:bg-main-100 hover:text-main-700',
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

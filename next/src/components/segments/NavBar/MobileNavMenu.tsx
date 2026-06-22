import { Button } from '@bratislava/component-library'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ComponentProps, forwardRef } from 'react'
import { useEventListener, useScrollLock, useWindowSize } from 'usehooks-ts'

import { useNavMenuContext } from '@/src/components/segments/NavBar/navMenuContext'
import useMenu from '@/src/components/segments/NavBar/useMenu'
import { DropdownMenuItemProps } from '@/src/components/simple-components/DropdownMenu/DropdownMenu'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import IdentityVerificationStatus from '@/src/components/simple-components/IdentityVerificationStatus'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import logger from '@/src/frontend/utils/logger'
import cn from '@/src/utils/cn'
import { ROUTES } from '@/src/utils/routes'

type NavMenuLinkProps = Omit<ComponentProps<typeof NextLink>, 'as' | 'passHref' | 'href'> & {
  menuItem: DropdownMenuItemProps
  isActive?: boolean
  onClick: () => void
}

const NavMenuLink = forwardRef<HTMLAnchorElement, NavMenuLinkProps>(
  ({ menuItem, isActive, onClick, ...rest }, forwardedRef) => {
    return menuItem.url ? (
      <NextLink
        href={menuItem.url}
        // without forwardedRef, you can't navigate using arrow keys
        ref={forwardedRef}
        // without ...rest, you can't navigate using arrow keys
        {...rest}
        onClick={onClick}
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-lg border-b border-transparent p-4 text-size-p-small-r font-semibold base-focus-ring transition-all hover:bg-gray-100 lg:text-size-p-small',
          {
            'bg-gray-100': isActive,
          },
        )}
        data-cy={`${menuItem.url.replaceAll('/', '')}-menu-item`}
      >
        <div aria-hidden>{menuItem.icon}</div>
        <span>{menuItem.title}</span>
        {menuItem.url === ROUTES.USER_PROFILE && <IdentityVerificationStatus />}
      </NextLink>
    ) : null
  },
)

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=CNuSyEBQeFkOyug9-4
 */

export const MobileNavMenu = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const { height } = useWindowSize()
  const heightWithoutHeader = `calc(${height}px - 14*4px)`

  const { isSignedIn } = useSsrAuth()

  const { isMobileMenuOpen, setMobileMenuOpen } = useNavMenuContext()
  const { mainMenuItems, signedInActionsMenuItems, notSignedInActionsMenuItems } = useMenu()

  const closeMenu = () => setMobileMenuOpen(false)

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileMenuOpen(false)
    }
  })

  useScrollLock()

  return (
    <div
      className={cn(
        'fixed top-14 left-0 z-28 flex w-screen flex-col gap-4 overflow-y-auto bg-background-passive-base p-4 lg:hidden',
        {
          'animate-fade-in': isMobileMenuOpen,
          'animate-fade-out': !isMobileMenuOpen,
        },
      )}
      style={{ height: heightWithoutHeader }}
    >
      <NavigationMenu.Root aria-label={t('NavMenu.aria.navMenuLabel')}>
        <NavigationMenu.List className="flex flex-col">
          {mainMenuItems.map((sectionItem) => (
            <NavigationMenu.Item key={sectionItem.id}>
              <NavigationMenu.Link asChild>
                <NavMenuLink
                  menuItem={sectionItem}
                  isActive={router.route.endsWith(sectionItem.url)}
                  onClick={closeMenu}
                />
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          ))}

          <HorizontalDivider asListItem className="my-4" />

          {(isSignedIn ? signedInActionsMenuItems : notSignedInActionsMenuItems).map((menuItem) => {
            return (
              <NavigationMenu.Item key={menuItem.id}>
                {menuItem.onPress ? (
                  <Button
                    variant="unstyled"
                    startIcon={menuItem.icon}
                    fullWidth
                    className="flex items-center gap-3 rounded-lg border-b border-transparent p-4 text-size-p-small-r font-semibold transition-all hover:bg-main-100 hover:text-main-700 lg:text-size-p-small"
                    data-cy={`${menuItem.title.replaceAll(' ', '-')}-menu-item`}
                    onPress={() => {
                      menuItem.onPress?.()?.catch((error) => logger.error(error))
                      closeMenu()
                    }}
                  >
                    {menuItem.title}
                  </Button>
                ) : menuItem.url ? (
                  <NavigationMenu.Link asChild>
                    <NavMenuLink
                      menuItem={menuItem}
                      isActive={router.route.endsWith(menuItem.url)}
                      onClick={closeMenu}
                    />
                  </NavigationMenu.Link>
                ) : null}
              </NavigationMenu.Item>
            )
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  )
}

export default MobileNavMenu

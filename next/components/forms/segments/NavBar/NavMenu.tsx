import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { useNavMenuContext } from 'components/forms/segments/NavBar/navMenuContext'
import { MenuSectionBase } from 'components/forms/segments/NavBar/useMenu'
import cn from 'frontend/cn'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

type Props = {
  menuSections: MenuSectionBase[]
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */

export const NavMenu = ({
  menuSections,
}: Props) => {
  const { t } = useTranslation('account')
  const router = useRouter()

  const { menuValue, setMenuValue } = useNavMenuContext()

  const isActive = (sectionItem: MenuSectionBase) =>
    sectionItem.url === '/' ? router.pathname === '/' : router.pathname.startsWith(sectionItem.url)

  return (
    menuSections && (
      <div className="m-auto hidden h-[57px] w-full max-w-(--breakpoint-lg) items-center justify-between border-t border-gray-200 lg:flex">
        <NavigationMenu.Root
          value={menuValue}
          onValueChange={setMenuValue}
          aria-label={t('NavMenu.aria.navMenuLabel')}
          /**
           * Because of https://github.com/radix-ui/primitives/discussions/1874,
           * we can't directly access subelement (<div style="position: relative;")
           * of "<nav>" element that NavigationMenu.List creates when used.
           * To solve this, we add grid class to the parent element.
           */
          className="grid size-full"
        >
          <NavigationMenu.List className="flex size-full items-center">
            {menuSections.map((sectionItem) => (
              <NavigationMenu.Item key={sectionItem.id} className="size-full">
                <NavigationMenu.Link asChild>
                  <NextLink href={sectionItem.url}>
                    <div
                      className={cn(
                        'flex h-full w-full cursor-pointer items-center justify-center border-b-2 text-p2-semibold transition-all hover:border-main-700 hover:text-main-700',
                        {
                          'border-main-700 text-main-700': isActive(sectionItem),
                          'border-transparent': !isActive(sectionItem),
                        },
                      )}
                    >
                      {sectionItem.icon}
                      <span className="ml-3">{sectionItem.title}</span>
                    </div>
                  </NextLink>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    )
  )
}

export default NavMenu

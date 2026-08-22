import { Typography } from '@bratislava/component-library'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { useTranslation } from 'next-i18next/pages'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import { useNavMenu } from '@/src/components/segments/NavBar/useNavMenu'
import MLink from '@/src/components/simple-components/MLink'
import cn from '@/src/utils/cn'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */

export const NavMenu = () => {
  const { t } = useTranslation()

  const { mainMenuItems, isMenuItemActive } = useNavMenu()

  return (
    <SectionContainer>
      <div className="flex h-[57px] w-full items-center justify-between border-t border-border-passive-primary">
        <NavigationMenu.Root
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
            {mainMenuItems.map((sectionItem) => {
              const isActive = isMenuItemActive(sectionItem.url)

              return (
                <NavigationMenu.Item
                  key={sectionItem.id}
                  className="size-full rounded-sm wrapper-focus-ring ring-inset"
                >
                  <NavigationMenu.Link asChild active={isActive}>
                    <MLink href={sectionItem.url}>
                      <div
                        className={cn(
                          'flex size-full cursor-pointer items-center justify-center border-b-2 transition-all hover:border-content-error-hover hover:text-content-error-hover',
                          {
                            'border-content-error-default text-content-error-default': isActive,
                            'border-transparent': !isActive,
                          },
                        )}
                      >
                        {sectionItem.icon}
                        <Typography variant="p-small" as="span" className="ml-3 font-semibold">
                          {sectionItem.title}
                        </Typography>
                      </div>
                    </MLink>
                  </NavigationMenu.Link>
                </NavigationMenu.Item>
              )
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </SectionContainer>
  )
}

export default NavMenu

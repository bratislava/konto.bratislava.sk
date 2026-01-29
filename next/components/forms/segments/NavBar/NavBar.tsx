import { StatusBar } from 'components/forms/info-components/StatusBar'
import MobileNavBar from 'components/forms/segments/NavBar/MobileNavBar'
import NavBarHeader from 'components/forms/segments/NavBar/NavBarHeader'
import NavMenu from 'components/forms/segments/NavBar/NavMenu'
import { MenuSectionBase } from 'components/forms/segments/NavBar/useMenu'
import {
  MenuItemBase,
} from 'components/forms/simple-components/MenuDropdown/MenuDropdown'
import cn from 'frontend/cn'
import { RefObject } from 'react'

type Props = {
  sectionsList?: MenuSectionBase[]
  menuItems: MenuItemBase[]
  hideNavMenu?: boolean
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */

export const NavBar = ({
  sectionsList,
  menuItems,
  hideNavMenu,
  desktopNavbarRef,
  mobileNavbarRef,
  className,
}: Props) => {
  return (
    <>
      <div className="hidden lg:block">
        <StatusBar />
      </div>
      {/* Desktop */}
      <div
        id="desktop-navbar"
        className={cn(
          'sticky top-0 left-0 z-40 hidden w-full items-center bg-white text-p2 shadow-default lg:block',
          className,
        )}
        ref={desktopNavbarRef}
      >
        <NavBarHeader menuItems={menuItems} />
        {!hideNavMenu && <NavMenu menuSections={sectionsList ?? []} />}

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

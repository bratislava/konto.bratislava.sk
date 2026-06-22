import { RefObject, useRef } from 'react'
import { useResizeObserver } from 'usehooks-ts'

import MobileNavBar from '@/src/components/segments/NavBar/MobileNavBar'
import NavBarHeader from '@/src/components/segments/NavBar/NavBarHeader'
import NavMenu from '@/src/components/segments/NavBar/NavMenu'
import { AlertBanner } from '@/src/components/simple-components/AlertBanner'

type Props = {
  desktopNavbarRef: RefObject<HTMLDivElement | null>
  mobileNavbarRef: RefObject<HTMLDivElement | null>
  backButtonHidden?: boolean
  variant?: 'default' | 'auth'
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */
const NavBar = ({
  desktopNavbarRef,
  mobileNavbarRef,
  backButtonHidden,
  variant = 'default',
}: Props) => {
  const alertRef = useRef<HTMLDivElement>(null)
  const { height } = useResizeObserver({ ref: alertRef as React.RefObject<HTMLElement> })

  return (
    <>
      <div className="hidden w-full bg-background-passive-base lg:block" ref={desktopNavbarRef}>
        <AlertBanner />
        <div className="relative w-full">
          <NavBarHeader backButtonHidden={backButtonHidden} />
          {variant === 'default' ? <NavMenu /> : null}
        </div>
      </div>
      <div style={{ height }} aria-hidden className="hidden lg:block" />

      <MobileNavBar
        mobileNavbarRef={mobileNavbarRef}
        variant={variant}
        backButtonHidden={backButtonHidden}
        className="lg:hidden"
      />
    </>
  )
}

export default NavBar

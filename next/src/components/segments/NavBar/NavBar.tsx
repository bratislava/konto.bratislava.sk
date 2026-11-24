import MobileNavBar from '@/src/components/segments/NavBar/MobileNavBar'
import NavBarHeader from '@/src/components/segments/NavBar/NavBarHeader'
import NavMenu from '@/src/components/segments/NavBar/NavMenu'
import { AlertBanner } from '@/src/components/simple-components/AlertBanner'

type Props = {
  variant?: 'default' | 'auth'
  hasBackButton?: boolean
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21360&t=EGiWvvrAjJLDEfQk-4
 */
const NavBar = ({ hasBackButton = false, variant = 'default' }: Props) => {
  return (
    <>
      <div id="desktop-navbar" className="hidden w-full bg-background-passive-base lg:block">
        <AlertBanner />
        <div className="relative w-full">
          <NavBarHeader variant={variant} hasBackButton={hasBackButton} />
          {variant === 'default' ? <NavMenu /> : null}
        </div>
      </div>

      <MobileNavBar variant={variant} hasBackButton={hasBackButton} className="lg:hidden" />
    </>
  )
}

export default NavBar

import LoginRegisterNavBar from 'components/forms/segments/LoginRegisterNavBar/LoginRegisterNavBar'
import NavBar from 'components/forms/segments/NavBar/NavBar'
import useMenu from 'components/forms/segments/NavBar/useMenu'
import { useNavbarHeight } from 'components/layouts/useNavbarHeight'
import cn from 'frontend/cn'
import { ReactNode } from 'react'

declare module 'react' {
  interface CSSProperties {
    '--main-scroll-top-margin'?: string
  }
}

type Props = {
  variant: 'default' | 'login-register'
  children: ReactNode
  hideNavbarHeader?: boolean
  hideBackButton?: boolean
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21361&m=dev
 */

const PageLayout = ({ variant = "default", className, children, hideNavbarHeader, hideBackButton }: Props) => {
  const { menuSections, menuItems } = useMenu()
  const { navbarHeight, desktopNavbarRef, mobileNavbarRef } = useNavbarHeight()

  return (
    <div className={cn('min-h-screen', className)}>
      {/* 'contents' class in header enables sticky elements inside it to work */}
      <header className="relative z-30 contents">
        {variant === 'login-register' ?
          <LoginRegisterNavBar
            backButtonHidden={hideBackButton}
            desktopNavbarRef={desktopNavbarRef}
            mobileNavbarRef={mobileNavbarRef}
          /> :
          <NavBar
            sectionsList={menuSections}
            menuItems={menuItems}
            hideNavbarHeader={hideNavbarHeader}
            desktopNavbarRef={desktopNavbarRef}
            mobileNavbarRef={mobileNavbarRef}
          />}
      </header>
      <main
        style={{
          '--main-scroll-top-margin': `${navbarHeight}px`,
        }}
        className={cn("relative **:scroll-mt-(--main-scroll-top-margin", {
          "md:gap-6 md:bg-background-passive-primary md:py-8": variant === "login-register"
        })}
      >
        {children}
      </main>
    </div>
  )
}

export default PageLayout

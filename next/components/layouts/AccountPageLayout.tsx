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
  children: ReactNode
  hideNavbarHeader?: boolean
  className?: string
}

const AccountPageLayout = ({ className, children, hideNavbarHeader }: Props) => {
  const { menuSections, menuItems } = useMenu()
  const { navbarHeight, desktopNavbarRef, mobileNavbarRef } = useNavbarHeight()

  return (
    <div className={cn('min-h-screen', className)}>
      {/* 'contents' class in header enables sticky elements inside it to work */}
      <header className="relative z-30 contents">
        <NavBar
          sectionsList={menuSections}
          menuItems={menuItems}
          hideNavbarHeader={hideNavbarHeader}
          desktopNavbarRef={desktopNavbarRef}
          mobileNavbarRef={mobileNavbarRef}
        />
      </header>
      <main
        style={{
          '--main-scroll-top-margin': `${navbarHeight}px`,
        }}
        className="relative **:scroll-mt-(--main-scroll-top-margin)"
      >
        {children}
      </main>
    </div>
  )
}

export default AccountPageLayout

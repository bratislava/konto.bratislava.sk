import { useResizeObserver } from '@react-aria/utils'
import NavBar from 'components/forms/segments/NavBar/NavBar'
import useMenu from 'components/forms/segments/NavBar/useMenu'
import cn from 'frontend/cn'
import { ReactNode, useRef, useState } from 'react'

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

  // https://stackoverflow.com/a/59253905
  const [mainScrollTopMargin, setMainScrollTopMargin] = useState(0)

  // It is not possible to measure the height of header directly, because it is `display: contents`.
  // The header also might include status bar, that we don't want to include in the height calculation 
  // because it hides when scrolling (as it is not sticky)
  const desktopNavbarRef = useRef<HTMLDivElement>(null)
  const mobileNavbarRef = useRef<HTMLDivElement>(null)

  const handleHeaderResize = () => {
    setMainScrollTopMargin(
      Math.max(
        desktopNavbarRef.current?.getBoundingClientRect().height ?? 0,
        mobileNavbarRef.current?.getBoundingClientRect().height ?? 0,
      ),
    )
  }

  useResizeObserver({ ref: desktopNavbarRef, onResize: handleHeaderResize })
  useResizeObserver({ ref: mobileNavbarRef, onResize: handleHeaderResize })

  const { menuSections, menuItems } = useMenu()

  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
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
          '--main-scroll-top-margin': `${mainScrollTopMargin}px`,
        }}
        className="relative z-0 **:scroll-mt-(--main-scroll-top-margin)"
      >
        <div className="bg-gray-0">{children}</div>
      </main>
    </div>
  )
}

export default AccountPageLayout

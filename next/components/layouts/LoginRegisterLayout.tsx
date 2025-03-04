import { useResizeObserver } from '@react-aria/utils'
import cx from 'classnames'
import LoginRegisterNavBar from 'components/forms/segments/LoginRegisterNavBar/LoginRegisterNavBar'
import { ReactNode, useRef, useState } from 'react'

interface LoginRegisterLayoutProps {
  className?: string
  children: ReactNode
  backButtonHidden?: boolean
}

// TODO consider deleting this file and use AccountPageLayout instead
const LoginRegisterLayout = ({
  className,
  children,
  backButtonHidden,
}: LoginRegisterLayoutProps) => {
  const [mainScrollTopMargin, setMainScrollTopMargin] = useState(0)

  // It is not possible to measure the height of header directly, because it is `display: contents`, the header also
  // might include status bar, that we don't want to include in the height calculation because it hides when scrolling
  // (as it is not sticky)
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

  return (
    <div className={cx('flex', 'flex-col', 'min-h-screen', className)}>
      <LoginRegisterNavBar
        backButtonHidden={backButtonHidden}
        desktopNavbarRef={desktopNavbarRef}
        mobileNavbarRef={mobileNavbarRef}
      />
      <main
        style={{
          '--main-scroll-top-margin': `${mainScrollTopMargin}px`,
        }}
        className="flex grow flex-col gap-0 pt-0 md:gap-6 md:bg-main-100 md:pt-8 **:scroll-mt-(--main-scroll-top-margin)"
      >
        {children}
      </main>
    </div>
  )
}

export default LoginRegisterLayout

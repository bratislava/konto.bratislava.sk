import LoginRegisterNavBar from 'components/forms/segments/LoginRegisterNavBar/LoginRegisterNavBar'
import { useNavbarHeight } from 'components/layouts/useNavbarHeight'
import cn from 'frontend/cn'
import { ReactNode } from 'react'

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

  const { navbarHeight, desktopNavbarRef, mobileNavbarRef } = useNavbarHeight()

  return (
    <div className={cn('min-h-screen', className)}>
      <LoginRegisterNavBar
        backButtonHidden={backButtonHidden}
        desktopNavbarRef={desktopNavbarRef}
        mobileNavbarRef={mobileNavbarRef}
      />
      <main
        style={{
          '--main-scroll-top-margin': `${navbarHeight}px`,
        }}
        className="**:scroll-mt-(--main-scroll-top-margin) md:gap-6 md:bg-background-passive-primary md:py-8"
      >
        {children}
      </main>
    </div>
  )
}

export default LoginRegisterLayout

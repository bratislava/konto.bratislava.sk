import { ReactNode } from 'react'

import { useNavbarHeight } from '@/src/components/layouts/useNavbarHeight'
import Footer from '@/src/components/segments/Footer/Footer'
import NavBar from '@/src/components/segments/NavBar/NavBar'
import cn from '@/src/utils/cn'

declare module 'react' {
  interface CSSProperties {
    '--main-scroll-top-margin'?: string
  }
}

type Props = {
  children: ReactNode
  variant?: 'default' | 'auth'
  hasBackButton?: boolean
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21361&m=dev
 */

const PageLayout = ({
  variant = 'default',
  className,
  children,
  hasBackButton = false,
}: Props) => {
  const { navbarHeight, desktopNavbarRef, mobileNavbarRef } = useNavbarHeight()

  return (
    <div className={cn('flex min-h-dvh flex-col', className)}>
      <header className="relative">
        <NavBar
          variant={variant}
          hasBackButton={hasBackButton}
          desktopNavbarRef={desktopNavbarRef}
          mobileNavbarRef={mobileNavbarRef}
        />
      </header>
      <main
        style={{
          '--main-scroll-top-margin': `${navbarHeight}px`,
        }}
        className={cn('relative flex grow flex-col **:scroll-mt-(--main-scroll-top-margin)', {
          'md:gap-6 md:bg-background-passive-primary md:py-8': variant === 'auth',
        })}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout

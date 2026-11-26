import { ReactNode } from 'react'

import Footer from '@/src/components/segments/Footer/Footer'
import NavBar from '@/src/components/segments/NavBar/NavBar'
import cn from '@/src/utils/cn'

type Props = {
  children: ReactNode
  variant?: 'default' | 'auth'
  hasBackButton?: boolean
  className?: string
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19549-21361&m=dev
 */

const PageLayout = ({ variant = 'default', className, children, hasBackButton = false }: Props) => {
  return (
    <div className={cn('flex min-h-dvh flex-col', className)}>
      <header className="relative">
        <NavBar variant={variant} hasBackButton={hasBackButton} />
      </header>
      <main
        // Only the mobile navbar is fixed, the desktop one scrolls away with the page
        className={cn('relative flex grow flex-col **:scroll-mt-mobile-navbar lg:**:scroll-mt-0', {
          'lg:gap-6 lg:bg-background-passive-primary lg:py-8': variant === 'auth',
        })}
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default PageLayout

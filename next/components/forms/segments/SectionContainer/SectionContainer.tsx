import React from 'react'

import cn from '@/frontend/cn'

interface SectionContainerProps {
  hasBackground?: boolean
}

export const SectionContainer = ({
  className,
  children,
  hasBackground = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & SectionContainerProps) => (
  <div
    className={cn(
      'px-8',
      {
        'bg-category-200': hasBackground === true,
      },
      className,
    )}
    {...rest}
  >
    <div className="mx-auto w-full max-w-(--breakpoint-lg)">{children}</div>
  </div>
)

export default SectionContainer

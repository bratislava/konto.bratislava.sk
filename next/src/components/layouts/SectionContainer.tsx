import { HTMLAttributes } from 'react'

import cn from '@/src/utils/cn'

type SectionContainerProps = HTMLAttributes<HTMLDivElement>

/**
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/layouts/SectionContainer.tsx
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=888-3154&m=dev
 * - We have no separate design for this component, but these properties should be shared among all sections in the design system
 */

const SectionContainer = ({ className, children, ...rest }: SectionContainerProps) => (
  // data-section-container-... attributes serve to target these divs by tailwind from above
  <div data-section-container-outer className={cn('relative', className)} {...rest}>
    <div
      data-section-container-inner
      className="@container mx-auto max-w-(--breakpoint-xl) px-4 lg:px-8"
    >
      {children}
    </div>
  </div>
)

export default SectionContainer

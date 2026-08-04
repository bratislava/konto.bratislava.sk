import { ReactNode, useRef } from 'react'

import DesktopTableOfContents from '@/src/components/common/TableOfContents/DesktopTableOfContents'
import MobileTableOfContents from '@/src/components/common/TableOfContents/MobileTableOfContents'
import useHeadings from '@/src/components/common/TableOfContents/useHeadings'
import cn from '@/src/utils/cn'

type Props = {
  scrollOffset?: number
  className?: string
  footerComponent?: ReactNode
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-20086&t=ETyVhQnBPMeYXsm0-4
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/page-contents/UrbanStudyPageContent.tsx#L118
 */

const TableOfContents = ({ scrollOffset, className, footerComponent }: Props) => {
  const headings = useHeadings()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={cn(
        'sticky top-12 flex max-w-200 flex-col overflow-hidden rounded-lg border border-border-passive-primary bg-background-passive-base',
        className,
      )}
    >
      <MobileTableOfContents
        containerRef={containerRef}
        headings={headings}
        scrollOffset={scrollOffset}
        footerComponent={footerComponent}
        className="lg:hidden"
      />
      <DesktopTableOfContents
        headings={headings}
        scrollOffset={scrollOffset}
        footerComponent={footerComponent}
        className="max-lg:hidden"
      />
    </div>
  )
}

export default TableOfContents

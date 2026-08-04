import { ReactNode, RefObject, useEffect, useState } from 'react'

import TableOfContentsLinks from '@/src/components/common/TableOfContents/TableOfContentsLinks'
import TableOfContentsTitle from '@/src/components/common/TableOfContents/TableOfContentsTitle'
import { Heading } from '@/src/components/common/TableOfContents/useHeadings'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'

// Where the table of contents sticks on small screens - navbar height (56px) + 32px gap.
// Applied by its sticky wrapper, used here to detect when it gets sticky.
export const TABLE_OF_CONTENTS_STICKY_TOP = 88

type Props = {
  // The sticky wrapper - its position and size drive the collapsing, not the ones of this component.
  containerRef: RefObject<HTMLDivElement | null>
  headings: Heading[]
  footerComponent?: ReactNode
  className?: string
}

const MobileTableOfContents = ({ containerRef, headings, footerComponent, className }: Props) => {
  // Expanded on mount, collapses once the table of contents gets sticky.
  const [isExpanded, setExpanded] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      // Until the table of contents reaches its sticky position, it stays open.
      if (!container || container.getBoundingClientRect().top > TABLE_OF_CONTENTS_STICKY_TOP) {
        return
      }

      // Collapse when it reaches it's sticky position.
      setExpanded(false)
      // Collapse only the first time, so the user can expand it again and keep it expanded.
      window.removeEventListener('scroll', handleScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef])

  /**
   * The current height is exactly how far below the clicked heading has to be scrolled - it covers
   * both the collapsed table of contents, which stays over the content while sticky, and the links,
   * whose collapsing moves the content below them up.
   */
  const getHeight = () => containerRef.current?.offsetHeight ?? 0

  return (
    <div className={className}>
      {headings.length ? (
        <Disclosure isExpanded={isExpanded} onExpandedChange={setExpanded}>
          <DisclosureHeader className="p-4 ring-inset open:border-b">
            <TableOfContentsTitle />
          </DisclosureHeader>
          {/* TODO remove "*:py-0" class, when our DisclosurePanel has option to disable the padding */}
          <DisclosurePanel className="*:py-0">
            <TableOfContentsLinks
              headings={headings}
              getAdditionalScrollOffset={getHeight}
              onItemPress={() => {
                setExpanded(false)
              }}
            />
          </DisclosurePanel>
        </Disclosure>
      ) : null}

      {footerComponent ? (
        <>
          <HorizontalDivider />
          <div className="p-4">{footerComponent}</div>
        </>
      ) : null}
    </div>
  )
}

export default MobileTableOfContents

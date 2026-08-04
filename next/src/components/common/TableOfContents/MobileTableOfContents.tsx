import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'

import TableOfContentsLinks from '@/src/components/common/TableOfContents/TableOfContentsLinks'
import TableOfContentsTitle from '@/src/components/common/TableOfContents/TableOfContentsTitle'
import { Heading } from '@/src/components/common/TableOfContents/useHeadings'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'

/**
 * Distance from the top of the window, where the table of contents sticks on small screens -
 * mobile navbar height (56px) + 32px gap below it.
 * The wrapper of the table of contents has to be the sticky element (inside it there would be no
 * room to move), so it is applied there and used here to detect when it gets sticky.
 */
export const TABLE_OF_CONTENTS_STICKY_TOP = 88

type Props = {
  /**
   * The sticky container of the table of contents - the collapsing is driven by its position and
   * size, not by the position and size of this component, which is offset by the container border.
   */
  containerRef: RefObject<HTMLDivElement | null>
  headings: Heading[]
  scrollOffset?: number
  footerComponent?: ReactNode
  className?: string
}

const MobileTableOfContents = ({
  containerRef,
  headings,
  scrollOffset,
  footerComponent,
  className,
}: Props) => {
  const linksRef = useRef<HTMLUListElement>(null)
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
   * Height of the collapsed table of contents (the title and the footer with CTAs), which covers
   * the content while it is sticky, so the clicked heading has to be scrolled below it.
   * Expects the links to be expanded, which is always the case when an item is pressed.
   */
  const getCollapsedHeight = () => {
    const container = containerRef.current
    const links = linksRef.current
    if (!container || !links) {
      return 0
    }

    return container.offsetHeight - links.offsetHeight
  }

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
              ref={linksRef}
              headings={headings}
              scrollOffset={scrollOffset}
              getAdditionalScrollOffset={getCollapsedHeight}
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

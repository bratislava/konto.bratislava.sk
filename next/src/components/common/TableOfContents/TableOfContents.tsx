import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { ReactNode, Ref, useEffect, useRef, useState } from 'react'

import useHeadings from '@/src/components/common/TableOfContents/useHeadings'
import Disclosure from '@/src/components/simple-components/Disclosure/Disclosure'
import DisclosureHeader from '@/src/components/simple-components/Disclosure/DisclosureHeader'
import DisclosurePanel from '@/src/components/simple-components/Disclosure/DisclosurePanel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import cn from '@/src/utils/cn'

type Props = {
  scrollOffset?: number
  className?: string
  footerComponent?: ReactNode
}

// Prevents from scrolling the clicked table of contents item to the very top of window,
// which would hide it behind navbar on small screens. Works also for desktop, so is set to default.
const DEFAULT_SCROLL_OFFSET = 120

/**
 * Distance from the top of the window, where the table of contents sticks on small screens -
 * mobile navbar height (56px) + 32px gap below it.
 * The wrapper of the table of contents has to be the sticky element (inside it there is no room to
 * move), so it is applied there and used here to detect when the table of contents gets stuck.
 */
export const TABLE_OF_CONTENTS_STICKY_TOP = 88

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=16846-20086&t=ETyVhQnBPMeYXsm0-4
 * Based on Bratislava.sk: https://github.com/bratislava/bratislava.sk/blob/master/next/src/components/page-contents/UrbanStudyPageContent.tsx#L118
 */

const TableOfContents = ({
  scrollOffset = DEFAULT_SCROLL_OFFSET,
  className,
  footerComponent,
}: Props) => {
  const { t } = useTranslation('account')
  const headings = useHeadings()
  const containerRef = useRef<HTMLDivElement>(null)
  const collapsibleLinksRef = useRef<HTMLUListElement>(null)
  // On small screens the table of contents is sticky, so it is expanded on mount and collapses
  // once it gets stuck, to not cover the content.
  const [isCollapsibleExpanded, setCollapsibleExpanded] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      // Until the table of contents reaches its sticky position, it scrolls away with the content,
      // so there is no reason to collapse it.
      if (!container || container.getBoundingClientRect().top > TABLE_OF_CONTENTS_STICKY_TOP) {
        return
      }

      setCollapsibleExpanded(false)
      // Collapse only the first time, so the user can expand it again and keep it expanded.
      window.removeEventListener('scroll', handleScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  /**
   * Height of the part of the sticky container that stays visible on small screens (the header and
   * the footer with CTAs), which the clicked heading has to be scrolled below.
   * Returns 0 on large screens, where the collapsible part is hidden and the container is rendered
   * next to the content instead of over it.
   * Expects the collapsible links to be expanded, which is always the case when an item is pressed.
   */
  const getCollapsedStickyHeight = () => {
    const container = containerRef.current
    const collapsibleLinks = collapsibleLinksRef.current
    if (!container || !collapsibleLinks || collapsibleLinks.offsetParent === null) {
      return 0
    }

    return container.offsetHeight - collapsibleLinks.offsetHeight
  }

  const handleItemPress = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (!element) {
      return
    }

    const elementPosition = element.getBoundingClientRect().top // current offset regarding the current window scroll
    const windowOffset = window.scrollY
    const offsetPosition =
      elementPosition + windowOffset - scrollOffset - getCollapsedStickyHeight()

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    // The links are not needed anymore and the collapsed height is what the offset above counts with.
    setCollapsibleExpanded(false)
  }

  const tocTitle = (
    <Typography variant="h5" as="h2">
      {t('TableOfContents.title')}
    </Typography>
  )

  const renderTocLinks = (ref?: Ref<HTMLUListElement>) => (
    <ul ref={ref} className="flex flex-col px-4 py-2 lg:px-6">
      {headings.map((heading) => {
        return (
          <li key={heading.id} className="py-2 lg:py-3">
            <Button
              variant="link"
              onPress={() => {
                handleItemPress(heading.id)
              }}
              // TODO remove when Button is updated in https://github.com/bratislava/component-library/pull/48
              className="text-left"
            >
              {heading.text}
            </Button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'sticky top-12 flex max-w-200 flex-col overflow-hidden rounded-lg border border-border-passive-primary bg-background-passive-base',
        className,
      )}
    >
      {headings.length ? (
        <>
          <Disclosure
            className="lg:hidden"
            isExpanded={isCollapsibleExpanded}
            onExpandedChange={setCollapsibleExpanded}
          >
            <DisclosureHeader className="p-4 ring-inset open:border-b">{tocTitle}</DisclosureHeader>
            {/* TODO remove "*:py-0" class, when our DisclosurePanel has option to disable the padding */}
            <DisclosurePanel className="*:py-0">
              {renderTocLinks(collapsibleLinksRef)}
            </DisclosurePanel>
          </Disclosure>

          <div className="max-lg:hidden">
            <div className="p-4 lg:p-6">{tocTitle}</div>
            <HorizontalDivider />
            {renderTocLinks()}
          </div>
        </>
      ) : null}

      {footerComponent ? (
        <>
          <HorizontalDivider />
          <div className="p-4 lg:p-6">{footerComponent}</div>
        </>
      ) : null}
    </div>
  )
}

export default TableOfContents

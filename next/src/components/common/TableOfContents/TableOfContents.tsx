import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { Fragment, ReactNode } from 'react'

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

  const handleItemPress = (id: string) => {
    const element = document.querySelector(`#${id}`)
    if (!element) {
      return
    }

    const elementPosition = element.getBoundingClientRect().top // current offset regarding the current window scroll
    const windowOffset = window.scrollY
    const offsetPosition = elementPosition + windowOffset - scrollOffset

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }

  const tocTitle = (
    <Typography variant="h5" as="h2">
      {t('TableOfContents.title')}
    </Typography>
  )

  const tocLinks = (
    <ul className="flex flex-col px-4 py-2 lg:px-6">
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
      className={cn(
        'sticky top-12 flex max-w-200 flex-col overflow-hidden rounded-lg border border-border-passive-primary bg-background-passive-base',
        className,
      )}
    >
      {headings.length ? (
        <>
          <Disclosure className="lg:hidden">
            <DisclosureHeader className="p-4 ring-inset open:border-b">{tocTitle}</DisclosureHeader>
            {/* TODO remove "*:py-0" class, when our DisclosurePanel has option to disable the padding */}
            <DisclosurePanel className="*:py-0">{tocLinks}</DisclosurePanel>
          </Disclosure>

          <div className="max-lg:hidden">
            <div className="p-4 lg:p-6">{tocTitle}</div>
            <HorizontalDivider />
            {tocLinks}
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

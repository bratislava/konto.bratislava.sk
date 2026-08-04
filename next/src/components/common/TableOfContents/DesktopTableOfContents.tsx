import { ReactNode } from 'react'

import TableOfContentsLinks from '@/src/components/common/TableOfContents/TableOfContentsLinks'
import TableOfContentsTitle from '@/src/components/common/TableOfContents/TableOfContentsTitle'
import { Heading } from '@/src/components/common/TableOfContents/useHeadings'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'

type Props = {
  headings: Heading[]
  footerComponent?: ReactNode
  className?: string
}

const DesktopTableOfContents = ({ headings, footerComponent, className }: Props) => {
  return (
    <div className={className}>
      {headings.length ? (
        <>
          <div className="p-6">
            <TableOfContentsTitle />
          </div>
          <HorizontalDivider />
          <TableOfContentsLinks headings={headings} />
        </>
      ) : null}

      {footerComponent ? (
        <>
          <HorizontalDivider />
          <div className="p-6">{footerComponent}</div>
        </>
      ) : null}
    </div>
  )
}

export default DesktopTableOfContents

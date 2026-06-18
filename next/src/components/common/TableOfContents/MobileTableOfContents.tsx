import Content from '@/src/components/common/TableOfContents/Content'
import useHeadings from '@/src/components/common/TableOfContents/useHeadings'

const HEADER_OFFSET = 90

/**
 * Figma: https://www.figma.com/design/2qF09hDT9QNcpdztVMNAY4/OLO-Web?node-id=3480-20808&node-type=symbol&t=Sy9hMuI0D75f0mQ0-0
 *
 */

const MobileTableOfContents = () => {
  const headings = useHeadings()

  if (!headings?.length) {
    return null
  }

  return (
    <div className="border-b border-border-passive-primary">
      <Content headings={headings} headerOffset={HEADER_OFFSET} />
    </div>
  )
}

export default MobileTableOfContents

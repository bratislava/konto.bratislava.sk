import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

import Content from '@/src/components/common/TableOfContents/Content'
import useHeadings from '@/src/components/common/TableOfContents/useHeadings'

/**
 * Figma: https://www.figma.com/design/2qF09hDT9QNcpdztVMNAY4/OLO-Web?node-id=3480-20808&node-type=symbol&t=Sy9hMuI0D75f0mQ0-0
 *
 */

const DesktopTableOfContents = () => {
  const { t } = useTranslation('account')

  const headings = useHeadings()
  if (!headings?.length) {
    console.log('No headings found')

    return null
  }

  return (
    <div className="sticky top-5 flex flex-col divide-y divide-border-passive-primary overflow-hidden rounded-lg border border-border-passive-primary">
      <div className="p-6">
        <Typography variant="h5">{t('landingPage.headingsList')}</Typography>
      </div>
      <Content headings={headings} />
    </div>
  )
}

export default DesktopTableOfContents

import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

const TableOfContentsTitle = () => {
  const { t } = useTranslation()

  return (
    <Typography variant="h5" as="h2">
      {t('TableOfContents.title')}
    </Typography>
  )
}

export default TableOfContentsTitle

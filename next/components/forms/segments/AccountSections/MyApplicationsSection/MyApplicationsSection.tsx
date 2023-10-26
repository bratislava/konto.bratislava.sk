import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect } from 'react'

import MyApplicationsHeader, {
  ApplicationsListVariant,
  isValidSection,
} from './MyApplicationsHeader'
import MyApplicationsList from './MyApplicationsList'

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')
  const router = useRouter()
  const section = router.query.section as ApplicationsListVariant

  useEffect(() => {
    // If section is not valid, redirect to default section
    if (!section || !isValidSection(section)) {
      router
        .push({
          pathname: router.pathname,
          query: { ...router.query, section: 'SENT' },
        })
        .catch((error) => logger.error(error))
    }
  }, [section, router])

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader title={t('account_section_applications.navigation')} />
      <MyApplicationsList variant={section} />
    </div>
  )
}

export default MyApplicationsSection

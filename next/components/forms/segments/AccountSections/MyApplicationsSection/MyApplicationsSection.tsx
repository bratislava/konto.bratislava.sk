import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { useEffectOnceWhen } from 'rooks'

import MyApplicationsHeader from './MyApplicationsHeader'
import MyApplicationsList from './MyApplicationsList'

const sections = ['SENT', 'SENDING', 'DRAFT'] as const
export type ApplicationsListVariant = (typeof sections)[number]

const isValidSection = (hash: string): hash is ApplicationsListVariant => {
  return (sections as readonly string[]).includes(hash)
}

const useCurrentSection = () => {
  const [currentSection, setCurrentSection] = useState<ApplicationsListVariant>('SENT')
  const router = useRouter()

  useEffectOnceWhen(() => {
    // If the URL contains a valid hash, use it to set the currentSection
    if (window.location.hash && isValidSection(window.location.hash.slice(1))) {
      setCurrentSection(window.location.hash.slice(1) as ApplicationsListVariant)
      return
    }

    // Otherwise, sync the hash with the currentSection
    router.push(`#${currentSection}`).catch((error) => logger.error(error))
  }, router.isReady)

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location
      if (isValidSection(hash.slice(1))) {
        setCurrentSection(hash.slice(1) as ApplicationsListVariant)
      } else {
        router.replace(`#${currentSection}`).catch((error) => logger.error(error))
      }
    }

    // Listen for hash changes and update currentSection in state
    router.events.on('hashChangeComplete', handleHashChange)
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      // Clean up event listener
      router.events.off('hashChangeComplete', handleHashChange)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [router.events, currentSection, router])

  return currentSection
}

const MyApplicationsSection = () => {
  const { t } = useTranslation('account')
  const section = useCurrentSection()

  return (
    <div className="flex flex-col">
      <MyApplicationsHeader
        title={t('account_section_applications.navigation')}
        section={section}
      />
      <MyApplicationsList variant={section} />
    </div>
  )
}

export default MyApplicationsSection

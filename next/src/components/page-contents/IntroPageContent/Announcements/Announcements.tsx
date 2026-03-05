import { useTranslation } from 'next-i18next'
import React from 'react'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import AnnouncementBlockStrapi from '@/src/components/page-contents/IntroPageContent/Announcements/AnnouncementBlockStrapi'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

type AnnouncementsProps = {
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const Announcements = ({ announcements, announcementsLegalPerson }: AnnouncementsProps) => {
  const { isLegalEntity } = useSsrAuth()
  const { t } = useTranslation('account')

  const announcementsByPersonType = isLegalEntity ? announcementsLegalPerson : announcements

  return (
    <div className="mx-auto max-w-(--breakpoint-xl) px-4 lg:px-8">
      <div className="flex flex-col gap-4 py-6 lg:gap-6 lg:py-16">
        <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>
        {announcementsByPersonType.map((announcement, index) => (
          <AnnouncementBlockStrapi
            key={announcement.id}
            announcement={announcement}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  )
}

export default Announcements

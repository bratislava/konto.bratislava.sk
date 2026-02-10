import { useTranslation } from 'next-i18next'
import React from 'react'

import { HomepageAnnouncementEntityFragment } from '@/clients/graphql-strapi/api'
import { useSsrAuth } from '@/frontend/hooks/useSsrAuth'

import AnnouncementBlockStrapi from './AnnouncementBlockStrapi'

type AnnouncementsProps = {
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const Announcements = ({ announcements, announcementsLegalPerson }: AnnouncementsProps) => {
  const { isLegalEntity } = useSsrAuth()
  const { t } = useTranslation('account')

  const announcementsByPersonType = isLegalEntity ? announcementsLegalPerson : announcements

  return (
    <div className="flex flex-col gap-4 px-4 py-6 lg:gap-6 lg:px-0 lg:py-16">
      <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>
      {announcementsByPersonType.map((announcement, index) => (
        <AnnouncementBlockStrapi
          key={announcement.id}
          announcement={announcement}
          reversed={index % 2 === 1}
        />
      ))}
    </div>
  )
}

export default Announcements

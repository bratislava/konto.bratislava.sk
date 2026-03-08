import { useTranslation } from 'next-i18next'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import AnnouncementBlockStrapi from '@/src/components/segments/Announcements/AnnouncementBlockStrapi'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

type Props = {
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const Announcements = ({ announcements, announcementsLegalPerson }: Props) => {
  const { isLegalEntity } = useSsrAuth()
  const { t } = useTranslation('account')

  const announcementsByPersonType = isLegalEntity ? announcementsLegalPerson : announcements

  return (
    <SectionContainer className="py-6 lg:py-18">
      <div className="flex flex-col gap-4 lg:gap-6">
        <h2 className="text-h2">{t('account_section_intro.announcement_title')}</h2>
        {announcementsByPersonType.map((announcement, index) => (
          <AnnouncementBlockStrapi
            key={announcement.id}
            announcement={announcement}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </SectionContainer>
  )
}

export default Announcements

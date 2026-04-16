import { useTranslation } from 'next-i18next/pages'

import { HomepageAnnouncementEntityFragment } from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import SectionHeader from '@/src/components/layouts/SectionHeader'
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
    <SectionContainer className="lg:py-18 py-6">
      <div className="flex flex-col gap-6">
        <SectionHeader title={t('account_section_intro.announcement_title')} titleLevel="h2" />
        {announcementsByPersonType.map((announcement, index) => (
          <AnnouncementBlockStrapi
            key={announcement.documentId}
            announcement={announcement}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </SectionContainer>
  )
}

export default Announcements

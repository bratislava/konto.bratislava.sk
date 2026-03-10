import { useTranslation } from 'next-i18next'

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
    <SectionContainer className="py-6 lg:py-18">
      <div className="flex flex-col gap-6">
        <SectionHeader title={t('account_section_intro.announcement_title')} titleLevel="h2" />
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

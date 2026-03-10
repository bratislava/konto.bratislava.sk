import { useTranslation } from 'next-i18next'

import BannerImage from '@/src/assets/images/bratislava-dog.png'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import SectionContainer from '@/src/components/layouts/SectionContainer'
import PhoneNumberModal from '@/src/components/modals/PhoneNumberModal'
import AnnouncementsHomepageSection from '@/src/components/segments/homepage-sections/AnnouncementsHomepageSection'
import MunicipalServicesHomepageSection from '@/src/components/segments/homepage-sections/MunicipalServicesHomepageSection'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import Banner from '@/src/components/simple-components/Banner'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  services: MunicipalServiceCardEntityFragment[]
  servicesLegalPerson: MunicipalServiceCardEntityFragment[]
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=11540-1892
 */

const HomepageContent = ({
  services,
  servicesLegalPerson,
  announcements,
  announcementsLegalPerson,
}: Props) => {
  const { t } = useTranslation('account')
  const { userAttributes, isLegalEntity } = useSsrAuth()

  const name = isLegalEntity ? userAttributes?.name : userAttributes?.given_name

  const servicesByPersonType = isLegalEntity ? servicesLegalPerson : services

  return (
    <>
      <PhoneNumberModal />
      <h1 className="sr-only">{t('common.bratislava_account')}</h1>
      <PageHeader
        title={
          name
            ? `${t('account_section_intro.header_title')} ${name}.`
            : t('account_section_intro.header_title_without_name')
        }
        text={t('account_section_intro.header_text')}
        titleAsParagraph
      />

      <AnnouncementsHomepageSection
        announcements={announcements}
        announcementsLegalPerson={announcementsLegalPerson}
      />

      <MunicipalServicesHomepageSection services={servicesByPersonType} />

      <SectionContainer className="py-6 lg:bg-background-passive-primary lg:py-18">
        <Banner
          title={t('account_section_intro.banner_title')}
          content={t('account_section_intro.banner_content')}
          buttonText={t('account_section_intro.banner_button_text')}
          href={ROUTES.HELP}
          image={BannerImage}
        />
      </SectionContainer>
    </>
  )
}

export default HomepageContent

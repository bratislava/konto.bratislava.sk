import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'

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
      <Typography variant="h1" className="sr-only">
        {t('common.bratislava_account')}
      </Typography>
      <PageHeader
        title={
          name
            ? `${t('HomepageContent.headerTitle')} ${name}.`
            : t('HomepageContent.headerTitleWithoutName')
        }
        text={t('HomepageContent.headerText')}
        titleAsParagraph
      />

      <AnnouncementsHomepageSection
        announcements={announcements}
        announcementsLegalPerson={announcementsLegalPerson}
      />

      <MunicipalServicesHomepageSection services={servicesByPersonType} />

      <SectionContainer className="py-6 lg:bg-background-passive-primary lg:py-18">
        <Banner
          title={t('HomepageContent.bannerTitle')}
          content={t('HomepageContent.bannerContent')}
          buttonText={t('HomepageContent.bannerButtonText')}
          href={ROUTES.HELP}
          image={BannerImage}
        />
      </SectionContainer>
    </>
  )
}

export default HomepageContent

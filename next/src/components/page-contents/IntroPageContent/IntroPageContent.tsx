import { useTranslation } from 'next-i18next'

import BannerImage from '@/src/assets/images/bratislava-dog.png'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import PhoneNumberModal from '@/src/components/modals/PhoneNumberModal'
import Announcements from '@/src/components/page-contents/IntroPageContent/Announcements/Announcements'
import MunicipalServiceCard from '@/src/components/segments/MunicipalServiceCard/MunicipalServiceCard'
import PageHeader from '@/src/components/segments/PageHeader/PageHeader'
import Banner from '@/src/components/simple-components/Banner'
import Button from '@/src/components/simple-components/Button'
import ResponsiveCarousel from '@/src/components/simple-components/Carousel/ResponsiveCarousel'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { ROUTES } from '@/src/utils/routes'

type Props = {
  services: MunicipalServiceCardEntityFragment[]
  servicesLegalPerson: MunicipalServiceCardEntityFragment[]
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const IntroPageContent = ({
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
      <div className="flex flex-col">
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
        <div className="m-auto w-full max-w-(--breakpoint-lg)">
          <Announcements
            announcements={announcements}
            announcementsLegalPerson={announcementsLegalPerson}
          />

          {/* TODO remove custom spacing on respo when proper layout is introduced */}
          <HorizontalDivider className="max-lg:mx-4" />

          <div className="flex flex-col gap-6 py-6 lg:py-16">
            <div className="flex w-full flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between lg:px-0">
              <h2 className="text-h2">{t('account_section_services.navigation')}</h2>
              <Button variant="link" href={ROUTES.MUNICIPAL_SERVICES}>
                {t('account_section_intro.all_services')}
              </Button>
            </div>
            <ResponsiveCarousel
              desktop={4}
              items={servicesByPersonType.map((service) => (
                <MunicipalServiceCard key={service.id} service={service} />
              ))}
              hasVerticalPadding={false}
            />
          </div>
        </div>
        <div className="bg-gray-50 py-0 lg:py-16">
          <Banner
            title={t('account_section_intro.banner_title')}
            content={t('account_section_intro.banner_content')}
            buttonText={t('account_section_intro.banner_button_text')}
            href={ROUTES.HELP}
            image={BannerImage}
          />
        </div>
      </div>
    </>
  )
}

export default IntroPageContent

import { useTranslation } from 'next-i18next'

import BannerImage from '@/src/assets/images/bratislava-dog.png'
import {
  HomepageAnnouncementEntityFragment,
  MunicipalServiceCardEntityFragment,
} from '@/src/clients/graphql-strapi/api'
import HorizontalDivider from '@/src/components/forms/HorizontalDivider'
import ResponsiveCarousel from '@/src/components/forms/ResponsiveCarousel'
import AccountSectionHeader from '@/src/components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Announcements from '@/src/components/forms/segments/AccountSections/IntroSection/Announcements/Announcements'
import MunicipalServiceCard from '@/src/components/forms/segments/MunicipalServiceCard/MunicipalServiceCard'
import PhoneNumberModal from '@/src/components/forms/segments/PhoneNumberModal/PhoneNumberModal'
import Banner from '@/src/components/forms/simple-components/Banner'
import Button from '@/src/components/forms/simple-components/Button'
import { ROUTES } from '@/src/frontend/api/constants'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'

type IntroSectionProps = {
  services: MunicipalServiceCardEntityFragment[]
  servicesLegalPerson: MunicipalServiceCardEntityFragment[]
  announcements: HomepageAnnouncementEntityFragment[]
  announcementsLegalPerson: HomepageAnnouncementEntityFragment[]
}

const IntroSection = ({
  services,
  servicesLegalPerson,
  announcements,
  announcementsLegalPerson,
}: IntroSectionProps) => {
  const { t } = useTranslation('account')
  const { userAttributes, isLegalEntity } = useSsrAuth()

  const name = isLegalEntity ? userAttributes?.name : userAttributes?.given_name

  const servicesByPersonType = isLegalEntity ? servicesLegalPerson : services

  return (
    <>
      <PhoneNumberModal />
      <div className="flex flex-col">
        <h1 className="sr-only">{t('common.bratislava_account')}</h1>
        <AccountSectionHeader
          title={
            name
              ? `${t('account_section_intro.header_title')} ${name}.`
              : `${t('account_section_intro.header_title_without_name')}`
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

export default IntroSection

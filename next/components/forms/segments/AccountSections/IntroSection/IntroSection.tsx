import BannerImage from '@assets/images/bratislava-dog.png'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Banner from 'components/forms/simple-components/Banner'
import Button from 'components/forms/simple-components/Button'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { serviceCards } from 'frontend/constants/constants'
import { isDefined } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'

import { ROUTES } from '../../../../../frontend/api/constants'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import PhoneNumberModal from '../../PhoneNumberModal/PhoneNumberModal'
import Announcements from './Announcements/Announcements'

const IntroSection = () => {
  const { t } = useTranslation('account')
  const { userAttributes, isLegalEntity } = useSsrAuth()

  const name = isLegalEntity ? userAttributes?.name : userAttributes?.given_name

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_intro.banner_content',
  )}</span>`

  const foMunicipalServicesSection = [44, 9, 34, 35]
  const poMunicipalServicesSection = [34, 35, 43, 4]

  const serviceCardIndexes = isLegalEntity ? poMunicipalServicesSection : foMunicipalServicesSection

  const filteredServiceCards = serviceCardIndexes
    .map((id) => serviceCards.find((card) => card.id === id))
    .filter(isDefined)

  return (
    <>
      <PhoneNumberModal />
      <div className="flex flex-col">
        <h1 className="sr-only">{t('bratislava_account')}</h1>
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
          <Announcements />
          <div className="mx-4 border-b-2 border-gray-200 lg:mx-0" />
          <div className="flex flex-col gap-6 py-6 lg:py-16">
            <div className="flex w-full items-center justify-between px-4 lg:px-0">
              <h2 className="text-h2">{t('account_section_services.navigation')}</h2>
              <Button
                size="sm"
                className="hidden pl-4 pt-4 sm:flex"
                label={t('account_section_intro.all_services')}
                variant="link-category"
                href={ROUTES.MUNICIPAL_SERVICES}
              />
            </div>
            <div className="flex gap-3 overflow-x-scroll px-4 scrollbar-hide lg:gap-8 lg:px-0">
              {filteredServiceCards.map((card) => (
                <ServiceCard
                  key={card.id}
                  title={t(card.title)}
                  description={t(card.description)}
                  buttonText={t(card.buttonText)}
                  icon={card.icon}
                  href={card.href}
                  tag={card.tag ? t(card.tag) : undefined}
                  tagStyle={card.tagStyle}
                  plausibleProps={{ id: `Domov: ${t(card.title)}` }}
                />
              ))}
            </div>
            <Button
              size="sm"
              className="flex pl-4 pt-4 sm:hidden"
              label={t('account_section_intro.all_services')}
              variant="link-category"
              href={ROUTES.MUNICIPAL_SERVICES}
            />
          </div>
        </div>
        <div className="bg-gray-50 py-0 lg:py-16">
          <Banner
            title={t('account_section_intro.banner_title')}
            content={bannerContent}
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

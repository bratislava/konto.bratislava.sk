import BannerImage from '@assets/images/bratislava-dog.png'
import KupaliskaImg from '@assets/images/kupaliska.png'
import TaxesIcon from '@assets/images/new-icons/other/city-bratislava/taxes.svg'
import LibraryIcon from '@assets/images/new-icons/other/culture-communities/library.svg'
import SwimmingPoolIcon from '@assets/images/new-icons/other/education-sport/swimming-pool.svg'
import ParkingIcon from '@assets/images/new-icons/other/transport-and-maps/parking.svg'
import { Auth } from 'aws-amplify'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import AnnouncementBlock from 'components/forms/segments/AccountSections/IntroSection/AnnouncementBlock'
import Banner from 'components/forms/simple-components/Banner'
import Button from 'components/forms/simple-components/Button'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import { ROUTES } from '../../../../../frontend/api/constants'
import { PhoneNumberData } from '../../PhoneNumberForm/PhoneNumberForm'
import PhoneNumberModal from '../../PhoneNumberModal/PhoneNumberModal'

const IntroSection = () => {
  const { t } = useTranslation('account')
  const { userData, isLegalEntity } = useServerSideAuth()
  const router = useRouter()
  const [phoneNumberModal, setPhoneNumberModal] = useState<'hidden' | 'displayed' | 'dismissed'>(
    'hidden',
  )

  // because the effect depends on userData, which may get refreshed every few seconds
  // we need to track if the modal was dismissed and stop showing it afterwards if that's the case
  useEffect(() => {
    if (
      phoneNumberModal === 'hidden' &&
      userData &&
      !userData.phone_number &&
      ROUTES.REGISTER === router.query.from
    ) {
      setPhoneNumberModal('displayed')
    }
  }, [phoneNumberModal, router.query.from, userData])

  // TODO should be part of phonenumber modal, refactor
  const [phoneNumberError, setPhoneNumberError] = useState<Error | null>(null)
  const resetError = () => {
    setPhoneNumberError(null)
  }

  const onSubmitPhoneNumber = async (submitData: { data?: PhoneNumberData }) => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      if (
        await Auth.updateUserAttributes(user, {
          phone_number: submitData.data?.phone_number,
        })
      ) {
        setPhoneNumberModal('dismissed')
      }
    } catch (error) {
      if (isError(error)) {
        setPhoneNumberError(error)
      } else {
        logger.error(
          `${GENERIC_ERROR_MESSAGE} - unexpected object thrown in onSubmitPhoneNumber:`,
          error,
        )
        setPhoneNumberError(new Error('Unknown error'))
      }
    }
  }

  const name = isLegalEntity ? userData?.name : userData?.given_name

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_intro.banner_content',
  )}</span>`

  const announcementContent = `
<h4>${t('account_section_intro.announcement_card_title')}</h4><span>${t(
    'account_section_intro.announcement_card_text',
  )}</span>`

  return (
    <>
      {userData && (
        <PhoneNumberModal
          show={phoneNumberModal === 'displayed'}
          onClose={() => setPhoneNumberModal('dismissed')}
          onSubmit={onSubmitPhoneNumber}
          error={phoneNumberError}
          onHideError={resetError}
          defaultValues={{ phone_number: userData?.phone_number }}
        />
      )}
      <div className="flex flex-col">
        <AccountSectionHeader
          title={`${t('account_section_intro.header_title')} ${name || ''}.`}
          text={t('account_section_intro.header_text')}
        />
        <div className="w-full max-w-screen-lg m-auto py-6 lg:py-16">
          <AnnouncementBlock
            announcementContent={announcementContent}
            buttonTitle={t('account_section_intro.announcement_card_action')}
            imagePath={KupaliskaImg}
            onPress={() => {
              window.location.href = 'https://kupaliska.bratislava.sk'
            }}
          />

          <div className="w-full flex items-center justify-between mb-8 px-4 lg:px-0">
            <h2 className="text-h2">{t('account_section_services.navigation')}</h2>
            <Button
              size="sm"
              className="sm:flex hidden pt-4 pl-4"
              label={t('account_section_intro.all_services')}
              variant="link-category"
              href={ROUTES.MUNICIPAL_SERVICES}
            />
          </div>
          <div className="flex gap-3 lg:gap-8 overflow-x-scroll scrollbar-hide px-4 lg:px-0">
            <ServiceCard
              title={t('account_section_services.cards.32.title')}
              description={t('account_section_services.cards.32.description')}
              icon={<SwimmingPoolIcon className="w-10 h-10 lg:w-12 lg:h-12 text-education-700" />}
              buttonText={t('account_section_services.cards.32.buttonText')}
              href="https://kupaliska.bratislava.sk"
            />
            <ServiceCard
              title={t('account_section_services.cards.1.title')}
              description={t('account_section_services.cards.1.description')}
              icon={<TaxesIcon className="w-10 h-10 lg:w-12 lg:h-12 text-category-600" />}
              buttonText={t('account_section_services.cards.1.buttonText')}
              href={ROUTES.TAXES_AND_FEES}
            />
            <ServiceCard
              title={t('account_section_services.cards.4.title')}
              description={t('account_section_services.cards.4.description')}
              icon={<ParkingIcon className="w-10 h-10 lg:w-12 lg:h-12 text-transport-700" />}
              buttonText={t('account_section_services.cards.4.buttonText')}
              href="https://paas.sk/"
            />
            <ServiceCard
              title={t('account_section_services.cards.5.title')}
              description={t('account_section_services.cards.5.description')}
              icon={<LibraryIcon className="w-10 h-10 lg:w-12 lg:h-12 text-culture-700" />}
              buttonText={t('account_section_services.cards.5.buttonText')}
              href="https://mestskakniznica.sk/sluzby/citanie/ako-sa-prihlasit-do-kniznice"
            />
          </div>
          <Button
            size="sm"
            className="flex sm:hidden pt-4 pl-4"
            label={t('account_section_intro.all_services')}
            variant="link-category"
            href={ROUTES.MUNICIPAL_SERVICES}
          />
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

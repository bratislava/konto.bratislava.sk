import BannerImage from '@assets/images/bratislava-dog.png'
import { Auth } from 'aws-amplify'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import Banner from 'components/forms/simple-components/Banner'
import Button from 'components/forms/simple-components/Button'
import ServiceCard from 'components/forms/simple-components/ServiceCard'
import { environment } from 'environment'
import { useServerSideAuth } from 'frontend/hooks/useServerSideAuth'
import { GENERIC_ERROR_MESSAGE, isError } from 'frontend/utils/errors'
import logger from 'frontend/utils/logger'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'

import TaxesIcon from '../../../../../assets/icons/city-bratislava/taxes.svg'
import LibraryIcon from '../../../../../assets/icons/culture-communities/library.svg'
import SwimmingPoolIcon from '../../../../../assets/icons/education-sport/swimming-pool.svg'
import SpatialPlanningIcon from '../../../../../assets/icons/environment-construction/spatial-planning.svg'
import ParkingIcon from '../../../../../assets/icons/transport-and-maps/parking.svg'
import { ROUTES } from '../../../../../frontend/api/constants'
import { AccountType } from '../../../../../frontend/dtos/accountDto'
import { PhoneNumberData } from '../../PhoneNumberForm/PhoneNumberForm'
import PhoneNumberModal from '../../PhoneNumberModal/PhoneNumberModal'
import Announcements from './Announcements/Announcements'

const IntroSection = () => {
  const { t } = useTranslation('account')
  const { userData, accountType } = useServerSideAuth()
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

  const name =
    accountType === AccountType.PravnickaOsoba || accountType === AccountType.FyzickaOsobaPodnikatel
      ? userData?.name
      : userData?.given_name

  const bannerContent = `<span className='text-p2'>${t(
    'account_section_intro.banner_content',
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
        <div className="m-auto w-full max-w-screen-lg">
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
              {environment.featureToggles.formsInMenu ? (
                <>
                  <ServiceCard
                    title={t('account_section_services.cards.34.title')}
                    description={t('account_section_services.cards.34.description')}
                    icon={
                      <SpatialPlanningIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />
                    }
                    buttonText={t('account_section_services.cards.34.buttonText')}
                    href={ROUTES.MUNICIPAL_SERVICES_INVESTING}
                    plausibleProps={{
                      id: `Domov: ${t('account_section_services.cards.34.title')}`,
                    }}
                    tag={t('account_section_services.cards.34.tag')}
                    tagStyle="text-environment-700 bg-environment-100"
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.35.title')}
                    description={t('account_section_services.cards.35.description')}
                    icon={
                      <SpatialPlanningIcon className="h-10 w-10 text-environment-700 lg:h-12 lg:w-12" />
                    }
                    buttonText={t('account_section_services.cards.35.buttonText')}
                    href={ROUTES.MUNICIPAL_SERVICES_INVESTING_INTENT}
                    plausibleProps={{
                      id: `Domov: ${t('account_section_services.cards.35.title')}`,
                    }}
                    tag={t('account_section_services.cards.35.tag')}
                    tagStyle="text-environment-700 bg-environment-100"
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.1.title')}
                    description={t('account_section_services.cards.1.description')}
                    icon={<TaxesIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />}
                    buttonText={t('account_section_services.cards.1.buttonText')}
                    href={ROUTES.TAXES_AND_FEES}
                    plausibleProps={{ id: `Domov: ${t('account_section_services.cards.1.title')}` }}
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.4.title')}
                    description={t('account_section_services.cards.4.description')}
                    icon={<ParkingIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />}
                    buttonText={t('account_section_services.cards.4.buttonText')}
                    href="https://paas.sk/"
                    plausibleProps={{ id: `Domov: ${t('account_section_services.cards.4.title')}` }}
                  />
                </>
              ) : (
                <>
                  <ServiceCard
                    title={t('account_section_services.cards.32.title')}
                    description={t('account_section_services.cards.32.description')}
                    icon={
                      <SwimmingPoolIcon className="h-10 w-10 text-education-700 lg:h-12 lg:w-12" />
                    }
                    buttonText={t('account_section_services.cards.32.buttonText')}
                    href="https://kupaliska.bratislava.sk"
                    plausibleProps={{
                      id: `Domov: ${t('account_section_services.cards.32.title')}`,
                    }}
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.1.title')}
                    description={t('account_section_services.cards.1.description')}
                    icon={<TaxesIcon className="h-10 w-10 text-category-600 lg:h-12 lg:w-12" />}
                    buttonText={t('account_section_services.cards.1.buttonText')}
                    href={ROUTES.TAXES_AND_FEES}
                    plausibleProps={{ id: `Domov: ${t('account_section_services.cards.1.title')}` }}
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.4.title')}
                    description={t('account_section_services.cards.4.description')}
                    icon={<ParkingIcon className="h-10 w-10 text-transport-700 lg:h-12 lg:w-12" />}
                    buttonText={t('account_section_services.cards.4.buttonText')}
                    href="https://paas.sk/"
                    plausibleProps={{ id: `Domov: ${t('account_section_services.cards.4.title')}` }}
                  />
                  <ServiceCard
                    title={t('account_section_services.cards.5.title')}
                    description={t('account_section_services.cards.5.description')}
                    icon={<LibraryIcon className="h-10 w-10 text-culture-700 lg:h-12 lg:w-12" />}
                    buttonText={t('account_section_services.cards.5.buttonText')}
                    href="https://mestskakniznica.sk/sluzby/citanie/ako-sa-prihlasit-do-kniznice"
                    plausibleProps={{ id: `Domov: ${t('account_section_services.cards.5.title')}` }}
                  />
                </>
              )}
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

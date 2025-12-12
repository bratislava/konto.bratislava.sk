import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { useTranslation } from 'next-i18next'
import { TaxAvailabilityStatus } from 'openapi-clients/tax'
import React from 'react'
import { Tab, TabList, Tabs } from 'react-aria-components'

import TaxesFeesUserVerificationInProcess from './banners/TaxesFeesUserVerificationInProcess'
import TaxesFeesVerifyAndSetDeliveryMethodBanner from './banners/TaxesFeesVerifyAndSetDeliveryBanner'
import TaxesFeesAdministratorCardWrapper from './TaxesFeesAdministratorCard/TaxesFeesAdministratorCardWrapper'
import TaxesChannelChangeEffectiveNextYearAlert from './TaxesFeesDeliveryMethod/TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodChangeModal'
import { useTaxChannel } from './TaxesFeesDeliveryMethod/useTaxChannel'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesSearchingCard from './TaxesFeesSearchingCard'
import TaxFormAlert from './TaxFormAlert'
import { useStrapiTax } from './useStrapiTax'
import { useTaxFeesSection } from './useTaxFeesSection'

export const sections = ['PROPERTY_TAX'] as const

export type TaxVariant = (typeof sections)[number]

type HeaderNavigationItemBase = {
  title: string
  tag: TaxVariant
}

const TaxesFeesSection = () => {
  const {
    taxesData,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    strapiTaxAdministrator,
  } = useTaxFeesSection()
  const { accountCommunicationConsentText } = useStrapiTax()
  const { channel, showDeliveryMethodNotSetBanner, channelChangeEffectiveNextYear } =
    useTaxChannel()

  const strapiTax = useStrapiTax()
  const { t } = useTranslation('account')
  const { tierStatus } = useSsrAuth()
  const { isInQueue, isIdentityVerified } = tierStatus

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_payment.property_tax_title'), tag: 'PROPERTY_TAX' },
  ]

  const taxesDataAvailable = taxesData?.availabilityStatus === TaxAvailabilityStatus.Available
  const taxesDataNotOnRecord =
    taxesData?.availabilityStatus === TaxAvailabilityStatus.TaxNotOnRecord

  const displayTaxesLookingFor =
    taxesData?.availabilityStatus === TaxAvailabilityStatus.LookingForYourTax

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <AccountSectionHeader
        title={t('account_section_payment.title')}
        // not the best solution, but for proper one we need to rewrite components in Figma (pages, UserProfileView, HelpSection, IntroSection)
        titleWrapperClassName="pb-0 pt-8 lg:py-0"
        wrapperClassName="lg:pt-14"
      >
        {channel && (
          <div className="mx-4 flex flex-col gap-4 rounded-lg bg-gray-0 p-4 lg:mx-0 lg:gap-5 lg:p-5">
            <TaxesFeesDeliveryMethodCard
              onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
            />
            {channelChangeEffectiveNextYear && (
              <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
            )}
          </div>
        )}
        <Tabs selectedKey="PROPERTY_TAX" className="flex flex-col">
          <TabList className="scrollbar-hide flex gap-4 overflow-auto whitespace-nowrap lg:gap-6">
            {headerNavigationList.map((item) => {
              /* Hover without layout shift based on: https://stackoverflow.com/a/20249560 */
              return (
                <Tab
                  key={item.tag}
                  id={item.tag}
                  data-before-text={item.title}
                  className="cursor-pointer px-4 py-4 text-center text-20 transition-all before:invisible before:block before:h-0 before:overflow-hidden before:text-20-semibold before:content-[attr(data-before-text)] hover:border-gray-700 hover:text-20-semibold data-selected:border-b-2 data-selected:border-gray-700 data-selected:text-20-semibold lg:px-0"
                >
                  {item.title}
                </Tab>
              )
            })}
          </TabList>
        </Tabs>
      </AccountSectionHeader>
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 lg:gap-8 lg:px-0 lg:py-12">
        {((!isIdentityVerified && !isInQueue) || showDeliveryMethodNotSetBanner) && (
          <TaxesFeesVerifyAndSetDeliveryMethodBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        {isInQueue && <TaxesFeesUserVerificationInProcess />}
        {isIdentityVerified && !showDeliveryMethodNotSetBanner && (
          <>
            {(taxesData?.taxAdministrator || strapiTaxAdministrator) && (
              <TaxesFeesAdministratorCardWrapper
                beTaxAdministrator={taxesData?.taxAdministrator ?? null}
                strapiTaxAdministrator={strapiTaxAdministrator}
              />
            )}
            <div className="flex flex-col gap-4">
              <h2 className="text-h5-semibold">
                {t('account_section_payment.tax_overview_title')}
              </h2>
              {displayTaxesLookingFor && <TaxesFeesSearchingCard />}
              {taxesDataNotOnRecord && <TaxesFeesErrorCard />}
              {taxesDataAvailable && (
                <ul className="flex flex-col rounded-lg border-2 border-gray-200">
                  {taxesData.items.map((item) => (
                    <li
                      key={item.year}
                      className="mx-4 not-last:border-b-2 not-last:border-gray-200 lg:mx-6"
                    >
                      <TaxesFeesCard taxData={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <TaxFormAlert />
          </>
        )}
      </div>
    </>
  )
}

export default TaxesFeesSection

import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { useTranslation } from 'next-i18next'
import { TaxAvailabilityStatus, TaxStatusEnum } from 'openapi-clients/tax'
import React from 'react'
import { Tab, TabList, Tabs } from 'react-aria-components'

import TaxesChannelChangeEffectiveNextYearAlert from './TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesAdministratorCardWrapper from './TaxesFeesAdministratorCardWrapper'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesSearchingCard from './TaxesFeesSearchingCard'
import TaxesFeesVerifyAndSetDeliveryBanner from './TaxesFeesVerifyAndSetDeliveryBanner'
import TaxFormAlert from './TaxFormAlert'
import { useStrapiTax } from './useStrapiTax'
import { useTaxChannel } from './useTaxChannel'
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
  } = useTaxFeesSection()
  const { displayCurrentYearTaxInPreparation, accountCommunicationConsentText } = useStrapiTax()
  const { showEmailCommunicationBanner } = useTaxChannel()
  const { channelChangeEffectiveNextYear } = useTaxChannel()
  const strapiTax = useStrapiTax()
  const { t } = useTranslation('account')

  const headerNavigationList: HeaderNavigationItemBase[] = [
    { title: t('account_section_payment.property_tax_title'), tag: 'PROPERTY_TAX' },
  ]

  const currentYear = new Date().getFullYear()

  const taxesDataFound = taxesData.availabilityStatus === TaxAvailabilityStatus.Available

  const displayInPreparationCard =
    // TODO: Move this logic to BE
    displayCurrentYearTaxInPreparation &&
    ((taxesDataFound && !taxesData.items.some((item) => item.year === currentYear)) ||
      !taxesDataFound)
  const displayErrorCard = !taxesDataFound && !displayInPreparationCard

  const displayTaxesNotCheckedCard =
    taxesData.availabilityStatus === TaxAvailabilityStatus.LookingForYourTax

  // TODO: Add screen "overujeme vasu identitu" somewhere
  // TODO: fresh user that in the past didn't had any taxes, should see in from january to May one card "waiting for processing",
  // is it showing card "waiting for processing", when there is no past taxes?

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <AccountSectionHeader
        title={t('account_section_payment.title')}
        wrapperClassName="lg:py-0 lg:pt-16"
      >
        {!showEmailCommunicationBanner && (
          <div className="flex flex-col gap-4 rounded-lg bg-gray-0 p-4 lg:gap-5 lg:p-5">
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
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 sm:px-6 lg:gap-8 lg:px-0 lg:py-12">
        {showEmailCommunicationBanner && (
          <TaxesFeesVerifyAndSetDeliveryBanner
            onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
          />
        )}
        {!showEmailCommunicationBanner && (
          <>
            <TaxesFeesAdministratorCardWrapper />
            <div className="flex flex-col gap-4">
              <h2 className="text-h5-semibold">
                {t('account_section_payment.tax_overview_title')}
              </h2>
              {displayTaxesNotCheckedCard && <TaxesFeesSearchingCard />}
              {!displayTaxesNotCheckedCard && (
                <>
                  {displayErrorCard && <TaxesFeesErrorCard />}
                  {(displayInPreparationCard || taxesData.items.length > 0) && (
                    <ul className="flex flex-col gap-4">
                      {displayInPreparationCard && (
                        <li key={currentYear}>
                          <TaxesFeesCard
                            taxData={{
                              year: currentYear,
                              status: TaxStatusEnum.AwaitingProcessing,
                              amountToBePaid: 1000,
                            }}
                          />
                        </li>
                      )}
                      {taxesData.items.map((item) => (
                        <li key={item.year}>
                          <TaxesFeesCard taxData={item} />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
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

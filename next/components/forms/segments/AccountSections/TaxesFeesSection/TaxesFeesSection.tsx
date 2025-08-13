import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { WAITING_FOR_PROCESSING_STATUS } from 'frontend/types/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Tab, TabList, Tabs } from 'react-aria-components'

import TaxesChannelChangeEffectiveNextYearAlert from './TaxesChannelChangeEffectiveNextYearAlert'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesAdministratorCardWrapper from './TaxesFeesMetaInfoCards'
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

  const displayErrorCard = !taxesData.isInNoris
  const displayInPreparationCard =
    // TODO: Move this logic to BE
    taxesData.isInNoris &&
    !taxesData.items.some((item) => item.year === currentYear) &&
    displayCurrentYearTaxInPreparation
  const displayTaxCards = taxesData.items.length > 0

  // this should show when we not yet checked Norris in BE it is lastTaxBackendUploadTry variable
  const displayTaxesNotCheckedCard = false

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <div className="flex flex-col">
        <AccountSectionHeader title={t('account_section_payment.title')} />
        <div className="bg-gray-50">
          <div className="m-auto max-w-(--breakpoint-lg)">
            {!showEmailCommunicationBanner && (
              <>
                <div className="flex flex-col gap-4 rounded-lg bg-gray-0 p-4">
                  <TaxesFeesDeliveryMethodCard
                    onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
                  />
                  {channelChangeEffectiveNextYear && (
                    <TaxesChannelChangeEffectiveNextYearAlert strapiTax={strapiTax} />
                  )}
                </div>
                <Tabs selectedKey="PROPERTY_TAX" className="flex flex-col">
                  <TabList className="scrollbar-hide flex max-w-(--breakpoint-lg) gap-4 overflow-auto pt-6 whitespace-nowrap lg:gap-6 lg:pt-14">
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
              </>
            )}
          </div>
        </div>
        <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 sm:px-6 lg:gap-8 lg:px-0 lg:py-8">
          {showEmailCommunicationBanner && (
            <TaxesFeesVerifyAndSetDeliveryBanner
              onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
            />
          )}
          {!showEmailCommunicationBanner && (
            <>
              <TaxesFeesAdministratorCardWrapper />
              {displayTaxesNotCheckedCard && <TaxesFeesSearchingCard />}
              {!displayTaxesNotCheckedCard && (
                <>
                  {displayErrorCard && <TaxesFeesErrorCard />}
                  {(displayInPreparationCard || displayTaxCards) && (
                    <div className="flex flex-col gap-4">
                      <h2 className="text-h5-semibold">
                        {t('account_section_payment.tax_overview_title')}
                      </h2>
                      <ul className="flex flex-col gap-4">
                        {displayInPreparationCard && (
                          <li key={currentYear}>
                            <TaxesFeesCard
                              taxData={{
                                year: currentYear,
                                paidStatus: WAITING_FOR_PROCESSING_STATUS,
                                amount: null,
                                paidAmount: null,
                              }}
                              isActiveLink={false}
                            />
                          </li>
                        )}
                        {taxesData.items.map((item) => (
                          <li key={item.year}>
                            <TaxesFeesCard taxData={item} isActiveLink />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              <TaxFormAlert />
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default TaxesFeesSection

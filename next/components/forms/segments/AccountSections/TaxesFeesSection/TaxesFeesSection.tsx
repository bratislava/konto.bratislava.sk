import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

import TaxesFeesCards from './TaxesFeesCards'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesInPreparationCard from './TaxesFeesInPreparationCard'
import { useStrapiTax } from './useStrapiTax'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesSection = () => {
  const {
    taxesData,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
  } = useTaxFeesSection()
  const { displayCurrentYearTaxInPreparation, accountCommunicationConsentText } = useStrapiTax()
  const { t } = useTranslation('account')

  const displayErrorCard = !taxesData.isInNoris
  const displayInPreparationCard =
    // TODO: Move this logic to BE
    taxesData.isInNoris &&
    !taxesData.items.some((item) => item.year === new Date().getFullYear()) &&
    displayCurrentYearTaxInPreparation
  const displayTaxCards = taxesData.items.length > 0

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <div className="flex flex-col">
        <AccountSectionHeader title={t('account_section_payment.title')} />
        <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col gap-4 p-4 sm:px-6 lg:gap-8 lg:px-0 lg:py-8">
          <TaxesFeesCards />
          {displayErrorCard && <TaxesFeesErrorCard />}
          {(displayInPreparationCard || displayTaxCards) && (
            <div className="flex flex-col gap-4">
              {/* TODO: Translation */}
              <h2 className="text-h5-semibold">Daň z nehnuteľností</h2>
              {displayInPreparationCard && <TaxesFeesInPreparationCard />}
              {displayTaxCards && (
                <ul className="flex flex-col gap-4">
                  {taxesData.items.map((item) => (
                    <li key={item.year}>
                      <TaxesFeesCard taxData={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TaxesFeesSection

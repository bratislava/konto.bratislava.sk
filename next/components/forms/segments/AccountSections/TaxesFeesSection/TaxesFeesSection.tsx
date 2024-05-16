import Alert from 'components/forms/info-components/Alert'
import AccountSectionHeader from 'components/forms/segments/AccountSectionHeader/AccountSectionHeader'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFeesSection/TaxesFeesCard'
import { useTranslation } from 'next-i18next'
import React from 'react'

import TaxesFeesCards from './TaxesFeesCards'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesErrorCard from './TaxesFeesErrorCard'
import TaxesFeesInPreparationCard from './TaxesFeesInPreparationCard'
import { useTaxFeesSection } from './useTaxFeesSection'

const TaxesFeesSection = () => {
  const {
    taxesData,
    strapiTax: { displayCurrentYearTaxInPreparation, accountCommunicationConsentText },
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
  } = useTaxFeesSection()
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
        <div className="m-auto flex w-full max-w-screen-lg flex-col gap-4 p-4 sm:px-6 lg:gap-8 lg:px-0 lg:py-8">
          <TaxesFeesCards />
          {displayErrorCard && <TaxesFeesErrorCard />}
          {(displayInPreparationCard || displayTaxCards) && (
            <div className="flex flex-col gap-4">
              {/* TODO: Translation */}
              <h2 className="text-h5-bold">Daň z nehnuteľností</h2>
              {displayInPreparationCard ? (
                <TaxesFeesInPreparationCard />
              ) : (
                <Alert
                  type="warning"
                  className="mb-8"
                  fullWidth
                  message="Ak ste platili prevodom alebo QR kódom platbu pravdepodobne zaznamenáme až po 24.5."
                />
              )}

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

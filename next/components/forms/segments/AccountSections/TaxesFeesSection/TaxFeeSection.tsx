import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import React from 'react'

import { AccountType } from '../../../../../frontend/dtos/accountDto'
import { useSsrAuth } from '../../../../../frontend/hooks/useSsrAuth'
import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import TaxFooter from './TaxFooter'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxFeeSection = () => {
  const { accountType } = useSsrAuth()
  const {
    taxData,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    strapiTax: { accountCommunicationConsentText },
    taxAdministrator,
  } = useTaxFeeSection()
  const displayTaxAdministratorCard =
    taxAdministrator !== null && accountType === AccountType.FyzickaOsoba

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <div className="flex flex-col">
        <TaxFeeSectionHeader />
        <div className="max-w-(--breakpoint-lg) m-auto flex w-full flex-col items-center gap-6 py-6 lg:gap-12 lg:py-12">
          <div className="flex w-full flex-col gap-4 px-4 lg:flex-row lg:px-0">
            <TaxesFeesDeliveryMethodCard
              onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
            />
            {displayTaxAdministratorCard && (
              <TaxesFeesTaxAdministratorCard taxAdministrator={taxAdministrator} />
            )}
          </div>
          <ContactInformationSection />
          <TaxDetails />
          {taxData.isPayable && <PaymentData />}
          <TaxFooter />
        </div>
      </div>
    </>
  )
}

export default TaxFeeSection

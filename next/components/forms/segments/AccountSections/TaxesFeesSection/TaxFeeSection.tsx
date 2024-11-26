import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import React from 'react'

import ContactInformationSection from './ContactInformation'
import PaymentData from './PaymentData'
import TaxDetails from './TaxDetails'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxFooter from './TaxFooter'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxFeeSection = () => {
  const {
    taxData,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    strapiTax: { accountCommunicationConsentText },
  } = useTaxFeeSection()

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <div className="flex flex-col">
        <TaxFeeSectionHeader />
        <div className="m-auto flex w-full max-w-screen-lg flex-col items-center gap-6 py-6 lg:gap-12 lg:py-12">
          <div className="flex w-full flex-col px-4 lg:px-0">
            <TaxesFeesDeliveryMethodCard
              onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
            />
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

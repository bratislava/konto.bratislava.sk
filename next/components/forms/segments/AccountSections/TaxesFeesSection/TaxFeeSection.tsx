import Alert from 'components/forms/info-components/Alert'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import { useTranslation } from 'next-i18next'
import { TaxStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import ContactInformationSection from './ContactInformation'
import TaxDetails from './TaxDetails'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesDeliveryMethodInfoCard from './TaxesFeesDeliveryMethodInfoCard'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import PaymentMethodSection from './TaxFeePaymentMethodSection'
import { useStrapiTax } from './useStrapiTax'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxFeeSection = () => {
  const { t } = useTranslation('account')
  const {
    taxData,
    officialCorrespondenceChannelModalOpen,
    setOfficialCorrespondenceChannelModalOpen,
    strapiTaxAdministrator,
  } = useTaxFeeSection()
  const { accountCommunicationConsentText } = useStrapiTax()

  return (
    <>
      <TaxesFeesDeliveryMethodChangeModal
        isOpen={officialCorrespondenceChannelModalOpen}
        onOpenChange={setOfficialCorrespondenceChannelModalOpen}
        agreementContent={accountCommunicationConsentText}
      />
      <div className="flex flex-col">
        <TaxFeeSectionHeader />
        <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-12 lg:py-12">
          {(taxData.paidStatus === TaxStatusEnum.Paid ||
            taxData.paidStatus === TaxStatusEnum.OverPaid) && (
            <div className="w-full">
              <Alert type="success" fullWidth message={t('account_section_payment.tax_paid')} />
            </div>
          )}
          <div className="flex w-full flex-col gap-4 px-4 lg:flex-row lg:px-0">
            <TaxesFeesDeliveryMethodInfoCard />
            <TaxesFeesTaxAdministratorCard
              beTaxAdministrator={taxData.taxAdministrator}
              strapiTaxAdministrator={strapiTaxAdministrator}
            />
          </div>
          <ContactInformationSection />
          <TaxDetails />
          {taxData.paidStatus !== TaxStatusEnum.Paid &&
            taxData.paidStatus !== TaxStatusEnum.OverPaid && <PaymentMethodSection />}
        </div>
      </div>
    </>
  )
}

export default TaxFeeSection

import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import React from 'react'

import ContactInformationSection from './ContactInformation'
import TaxDetails from './TaxDetails'
import TaxesFeesDeliveryMethodCard from './TaxesFeesDeliveryMethodCard'
import TaxesFeesDeliveryMethodChangeModal from './TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesTaxAdministratorCard from './TaxesFeesTaxAdministratorCard'
import TaxFooter from './TaxFooter'
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
          <div className="flex w-full flex-col gap-4 px-4 lg:flex-row lg:px-0">
            <TaxesFeesDeliveryMethodCard
              onDeliveryMethodChange={() => setOfficialCorrespondenceChannelModalOpen(true)}
            />
            <TaxesFeesTaxAdministratorCard
              beTaxAdministrator={taxData.taxAdministrator}
              strapiTaxAdministrator={strapiTaxAdministrator}
            />
          </div>
          <ContactInformationSection />
          <TaxDetails />

          <ButtonNew
            variant="black-solid"
            href={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=zvysna-suma`}
            fullWidthMobile
          >
            {t('pay_all')}
            {t('pay_rest')}
          </ButtonNew>
          <ButtonNew
            variant="black-solid"
            href={`${ROUTES.TAXES_AND_FEES_PAYMENT(taxData.year)}?sposob-uhrady=splatky`}
            fullWidthMobile
          >
            {t('pay_installments')}
          </ButtonNew>

          <TaxFooter />
        </div>
      </div>
    </>
  )
}

export default TaxFeeSection

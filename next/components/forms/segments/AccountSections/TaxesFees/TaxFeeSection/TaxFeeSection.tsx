import Alert from 'components/forms/info-components/Alert'
import ResponsiveCarousel from 'components/forms/ResponsiveCarousel'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import TaxesFeesAdministratorCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesAdministratorCard/TaxesFeesAdministratorCardWrapper'
import TaxesFeesDeliveryMethodChangeModal from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodChangeModal'
import TaxesFeesDeliveryMethodInfoCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesDeliveryMethod/TaxesFeesDeliveryMethodInfoCardWrapper'
import TaxFeeContactInformation from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeContactInformation'
import TaxFeeDetails from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeDetails'
import TaxFeePaymentMethods from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentMethods/TaxFeePaymentMethods'
import { useStrapiTax } from 'components/forms/segments/AccountSections/TaxesFees/useStrapiTax'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { TaxStatusEnum } from 'openapi-clients/tax'
import React from 'react'

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
        <TaxFeeSectionHeader
          title={t('tax_detail_section.title', { year: taxData.year })}
          navigationItems={[
            { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
            {
              title: t('account_section_payment.tax_detail'),
              path: null,
            },
          ]}
        />
        <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-10 lg:py-10">
          {(taxData.paidStatus === TaxStatusEnum.Paid ||
            taxData.paidStatus === TaxStatusEnum.OverPaid) && (
            <div className="w-full px-4 lg:px-0">
              <Alert type="success" fullWidth message={t('account_section_payment.tax_paid')} />
            </div>
          )}
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:px-0">
            <ResponsiveCarousel
              controlsVariant="side"
              desktop={2}
              hasVerticalPadding={false}
              items={[
                <TaxesFeesDeliveryMethodInfoCardWrapper />,
                // this card is is slightly different than figma for sake of simplicity, it's missing part "Vas spravca dane"
                //  but it has "Spravca dane" in title instead, check with Zdenko if this is ok
                <TaxesFeesAdministratorCardWrapper
                  beTaxAdministrator={taxData.taxAdministrator}
                  strapiTaxAdministrator={strapiTaxAdministrator}
                />,
              ]}
            />
          </div>
          <TaxFeeContactInformation />
          <TaxFeeDetails />
          {taxData.paidStatus !== TaxStatusEnum.Paid &&
            taxData.paidStatus !== TaxStatusEnum.OverPaid && <TaxFeePaymentMethods />}
        </div>
      </div>
    </>
  )
}

export default TaxFeeSection

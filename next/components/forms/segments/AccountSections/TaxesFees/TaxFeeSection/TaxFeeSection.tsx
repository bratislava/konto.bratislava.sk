import Alert from 'components/forms/info-components/Alert'
import ResponsiveCarousel from 'components/forms/ResponsiveCarousel'
import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import OfficialCorrespondenceChannelCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelCardWrapper'
import TaxesFeesAdministratorCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesAdministratorCardWrapper'
import TaxFeeDetails from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeDetails'
import TaxFeePaymentMethods from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentMethods/TaxFeePaymentMethods'
import TaxFeeSubjectInformation from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeSubjectInformation'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { ROUTES } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import React from 'react'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1608&t=fznV5maoQK8a2irI-4
 */

const TaxFeeSection = () => {
  const { t } = useTranslation('account')
  const { taxData, strapiTaxAdministrator } = useTaxFeeSection()

  const pageTitle = {
    [TaxType.Dzn]: t('tax_detail_section.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('tax_detail_section.title.ko', { year: taxData.year, order: taxData.order }),
  }[taxData.type]

  const paymentSuccessMessage = {
    [TaxType.Dzn]: t('account_section_payment.payment_successful.dzn'),
    [TaxType.Ko]: t('account_section_payment.payment_successful.ko'),
  }[taxData.type]

  const breadcrumbs = [
    { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
    { title: pageTitle, path: null },
  ]

  const isTaxFeeSuccessfullyPaid =
    taxData.paidStatus === TaxStatusEnum.Paid || taxData.paidStatus === TaxStatusEnum.OverPaid

  const showTaxFeePaidAlert = isTaxFeeSuccessfullyPaid
  const showPaymentMethods = !isTaxFeeSuccessfullyPaid

  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader title={pageTitle} breadcrumbs={breadcrumbs} />
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-10 lg:py-10">
        {showTaxFeePaidAlert && <Alert type="success" fullWidth message={paymentSuccessMessage} />}
        <ResponsiveCarousel
          controlsVariant="side"
          desktop={2}
          hasVerticalPadding={false}
          items={[
            <OfficialCorrespondenceChannelCardWrapper />,
            <TaxesFeesAdministratorCardWrapper
              taxType={taxData.type}
              beTaxAdministrator={taxData.taxAdministrator}
              strapiTaxAdministrator={strapiTaxAdministrator}
            />,
          ]}
          className="w-full"
        />
        <TaxFeeSubjectInformation />
        <TaxFeeDetails />
        {showPaymentMethods && <TaxFeePaymentMethods />}
      </div>
    </div>
  )
}

export default TaxFeeSection

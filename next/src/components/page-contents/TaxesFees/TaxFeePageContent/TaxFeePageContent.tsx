import { useTranslation } from 'next-i18next'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'
import React from 'react'

import Alert from '@/src/components/forms/info-components/Alert'
import ResponsiveCarousel from '@/src/components/forms/ResponsiveCarousel'
import TaxFeeSectionHeader from '@/src/components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import OfficialCorrespondenceChannelCardWrapper from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelCardWrapper'
import TaxesFeesAdministratorCardWrapper from '@/src/components/page-contents/TaxesFees/shared/TaxesFeesAdministratorCardWrapper'
import TaxFeeDetails from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeeDetails'
import TaxFeePaymentMethods from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeePaymentMethods/TaxFeePaymentMethods'
import TaxFeeSubjectInformation from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeeSubjectInformation'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import { ROUTES } from '@/src/frontend/api/constants'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1608&t=fznV5maoQK8a2irI-4
 *
 * TODO Design for cancelled taxfee is not yet ready, update when availible
 */

const TaxFeePageContent = () => {
  const { t } = useTranslation('account')

  const { taxData, strapiTaxAdministrator } = useTaxFee()

  const pageTitle = {
    [TaxType.Dzn]: t('tax_detail_section.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('tax_detail_section.title.ko', { year: taxData.year, order: taxData.order }),
  }[taxData.type]

  const paymentSuccessMessage = {
    [TaxType.Dzn]: t('account_section_payment.payment_successful.dzn'),
    [TaxType.Ko]: t('account_section_payment.payment_successful.ko'),
  }[taxData.type]

  const paymentCancelledMessage = {
    [TaxType.Dzn]: t('account_section_payment.payment_cancelled.dzn'),
    [TaxType.Ko]: t('account_section_payment.payment_cancelled.ko'),
  }[taxData.type]

  const breadcrumbs = [
    { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
    { title: pageTitle, path: null },
  ]

  const isTaxFeeSuccessfullyPaid =
    taxData.paidStatus === TaxStatusEnum.Paid || taxData.paidStatus === TaxStatusEnum.OverPaid
  const isTaxFeeCancelled = taxData.paidStatus === TaxStatusEnum.Cancelled

  const showPaymentMethods = !isTaxFeeSuccessfullyPaid && !isTaxFeeCancelled

  const showTaxFeePaidAlert = isTaxFeeSuccessfullyPaid
  const showTaxFeeCancelledAlert = isTaxFeeCancelled

  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader title={pageTitle} breadcrumbs={breadcrumbs} />
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-10 lg:py-10">
        {showTaxFeePaidAlert && <Alert type="success" fullWidth message={paymentSuccessMessage} />}
        {showTaxFeeCancelledAlert && (
          <Alert type="info" fullWidth message={paymentCancelledMessage} />
        )}
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

export default TaxFeePageContent

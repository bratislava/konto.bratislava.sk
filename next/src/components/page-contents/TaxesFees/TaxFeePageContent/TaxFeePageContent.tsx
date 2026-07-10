import { useTranslation } from 'next-i18next/pages'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import DeliveryMethodCardWrapper from '@/src/components/page-contents/TaxesFees/shared/DeliveryMethodCardWrapper'
import TaxesFeesAdministratorCardWrapper from '@/src/components/page-contents/TaxesFees/shared/TaxesFeesAdministratorCardWrapper'
import TaxFeeDetails from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeeDetails'
import TaxFeePaymentMethods from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeePaymentMethods/TaxFeePaymentMethods'
import TaxFeeSubjectInformation from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeeSubjectInformation'
import { useStrapiTaxAdministrator } from '@/src/components/page-contents/TaxesFees/useStrapiTaxAdministrator'
import { useTaxData } from '@/src/components/page-contents/TaxesFees/useTaxData'
import TaxFeePageHeader from '@/src/components/segments/PageHeader/TaxFeePageHeader'
import Alert from '@/src/components/simple-components/Alert'
import ResponsiveCarousel from '@/src/components/simple-components/Carousel/ResponsiveCarousel'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1608&t=fznV5maoQK8a2irI-4
 *
 * TODO Design for cancelled taxfee is not yet ready, update when availible
 */

const TaxFeePageContent = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxData()
  const strapiTaxAdministrator = useStrapiTaxAdministrator()

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
      <TaxFeePageHeader title={pageTitle} breadcrumbs={breadcrumbs} />
      <SectionContainer className="py-6 lg:py-10">
        <div className="flex flex-col items-center gap-6 lg:gap-10">
          {showTaxFeePaidAlert && (
            <Alert type="success" fullWidth message={paymentSuccessMessage} />
          )}
          {showTaxFeeCancelledAlert && (
            <Alert type="info" fullWidth message={paymentCancelledMessage} />
          )}
          <ResponsiveCarousel
            controlsVariant="side"
            desktop={2}
            hasVerticalPadding={false}
            items={[
              <DeliveryMethodCardWrapper key="delivery-method" />,
              <TaxesFeesAdministratorCardWrapper
                key="tax-administrator"
                taxType={taxData.type}
                backendTaxAdministrator={taxData.taxAdministrator}
                strapiTaxAdministrator={strapiTaxAdministrator}
              />,
            ]}
            className="w-full"
          />
          <TaxFeeSubjectInformation />
          <TaxFeeDetails />
          {showPaymentMethods && <TaxFeePaymentMethods />}
        </div>
      </SectionContainer>
    </div>
  )
}

export default TaxFeePageContent

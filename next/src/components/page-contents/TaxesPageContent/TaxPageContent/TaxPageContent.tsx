import { useTranslation } from 'next-i18next/pages'
import { TaxStatusEnum, TaxType } from 'openapi-clients/tax'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import { resolveTaxAdministrator } from '@/src/components/page-contents/TaxesPageContent/resolveTaxAdministrator'
import DeliveryMethodCardWrapper from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodCardWrapper'
import TaxAdministratorCardWrapper from '@/src/components/page-contents/TaxesPageContent/shared/TaxAdministratorCardWrapper'
import TaxDetails from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxDetails'
import TaxPaymentMethods from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxPaymentMethods/TaxPaymentMethods'
import TaxSubjectInformation from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxSubjectInformation'
import { useStrapiTaxAdministrator } from '@/src/components/page-contents/TaxesPageContent/useStrapiTaxAdministrator'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import TaxPageHeader from '@/src/components/segments/PageHeader/TaxPageHeader'
import Alert from '@/src/components/simple-components/Alert'
import ResponsiveCarousel from '@/src/components/simple-components/Carousel/ResponsiveCarousel'
import { ROUTES } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/0VrrvwWs7n3T8YFzoHe92X/BK--Dizajn--DEV-?node-id=13580-1608&t=fznV5maoQK8a2irI-4
 *
 * TODO Design for cancelled tax is not yet ready, update when availible
 */

const TaxPageContent = () => {
  const { t } = useTranslation()

  const { taxData } = useTaxData()
  const strapiTaxAdministrator = useStrapiTaxAdministrator()

  const taxAdministrator = resolveTaxAdministrator({
    taxType: taxData.type,
    backendTaxAdministrator: taxData.taxAdministrator,
    strapiTaxAdministrator,
  })

  const pageTitle = {
    [TaxType.Dzn]: t('TaxPageContent.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('TaxPageContent.title.ko', { year: taxData.year, order: taxData.order }),
  }[taxData.type]

  const paymentSuccessMessage = {
    [TaxType.Dzn]: t('TaxPageContent.paymentSuccessful.dzn'),
    [TaxType.Ko]: t('TaxPageContent.paymentSuccessful.ko'),
  }[taxData.type]

  const paymentCancelledMessage = {
    [TaxType.Dzn]: t('TaxPageContent.paymentCancelled.dzn'),
    [TaxType.Ko]: t('TaxPageContent.paymentCancelled.ko'),
  }[taxData.type]

  const breadcrumbs = [
    { title: t('TaxesPageContent.title'), path: ROUTES.TAXES },
    { title: pageTitle, path: null },
  ]

  const isTaxSuccessfullyPaid =
    taxData.paidStatus === TaxStatusEnum.Paid || taxData.paidStatus === TaxStatusEnum.OverPaid
  const isTaxCancelled = taxData.paidStatus === TaxStatusEnum.Cancelled

  const showPaymentMethods = !isTaxSuccessfullyPaid && !isTaxCancelled

  const showTaxPaidAlert = isTaxSuccessfullyPaid
  const showTaxCancelledAlert = isTaxCancelled

  return (
    <div className="flex flex-col">
      <TaxPageHeader title={pageTitle} breadcrumbs={breadcrumbs} />
      <SectionContainer className="py-6 lg:py-10">
        <div className="flex flex-col items-center gap-6 lg:gap-10">
          {showTaxPaidAlert && <Alert type="success" fullWidth message={paymentSuccessMessage} />}
          {showTaxCancelledAlert && (
            <Alert type="info" fullWidth message={paymentCancelledMessage} />
          )}
          <ResponsiveCarousel
            controlsVariant="side"
            desktop={2}
            hasVerticalPadding={false}
            items={[
              <DeliveryMethodCardWrapper key="delivery-method" />,
              <TaxAdministratorCardWrapper
                key="tax-administrator"
                taxType={taxData.type}
                taxAdministrator={taxAdministrator}
              />,
            ]}
            className="w-full"
          />
          <TaxSubjectInformation />
          <TaxDetails />
          {showPaymentMethods && <TaxPaymentMethods />}
        </div>
      </SectionContainer>
    </div>
  )
}

export default TaxPageContent

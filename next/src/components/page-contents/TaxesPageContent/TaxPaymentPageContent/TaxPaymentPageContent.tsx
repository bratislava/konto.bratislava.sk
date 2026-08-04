import { useTranslation } from 'next-i18next/pages'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { TaxType } from 'openapi-clients/tax'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import DeliveryMethodNeededBanner from '@/src/components/page-contents/TaxesPageContent/shared/DeliveryMethodNeededBanner'
import IdentityVerificationBanner from '@/src/components/page-contents/TaxesPageContent/shared/IdentityVerificationBanner'
import TaxPaymentData from '@/src/components/page-contents/TaxesPageContent/TaxPaymentPageContent/TaxPaymentData'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import TaxPageHeader from '@/src/components/segments/PageHeader/TaxPageHeader'
import { useGetDeliveryMethod } from '@/src/frontend/hooks/useDeliveryMethod'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { PaymentMethod } from '@/src/frontend/types/paymentMethodTypes'
import { ROUTES } from '@/src/utils/routes'

// query param "sposob-uhrady" could have "zvysna suma" split to "zvysna-suma" and "jednorazova-uhrada"
// but only thing that is affecting is title of the page
const TaxPaymentPageContent = () => {
  const { t } = useTranslation('account')

  const [paymentMethodParam] = useQueryState(
    'sposob-uhrady',
    parseAsStringLiteral([PaymentMethod.RemainingAmount, PaymentMethod.Installments] as const)
      .withDefault(PaymentMethod.RemainingAmount)
      .withOptions({ clearOnDefault: false }),
  )

  const { taxData } = useTaxData()
  const isSinglePayment = taxData.overallAmount === taxData.overallBalance

  const { tierStatus } = useSsrAuth()
  const { isIdentityVerified, isInQueue } = tierStatus
  const { showDeliveryMethodNeededBanner } = useGetDeliveryMethod()

  const getTitle = () => {
    switch (paymentMethodParam) {
      case PaymentMethod.Installments:
        return t('TaxPaymentPageContent.title.installments')

      case PaymentMethod.RemainingAmount:
        return isSinglePayment
          ? t('TaxPaymentPageContent.title.all')
          : t('TaxPaymentPageContent.title.rest')

      default:
        return t('TaxPaymentPageContent.title.all')
    }
  }

  const detailPageTitle = {
    [TaxType.Dzn]: t('TaxPageContent.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('TaxPageContent.title.ko', { year: taxData.year, order: taxData.order }),
  }[taxData.type]

  const detailPagePath = ROUTES.TAXES_TAX_DETAIL({
    year: taxData.year,
    type: taxData.type,
    order: taxData.order,
  })

  return (
    <div className="flex flex-col">
      <TaxPageHeader
        title={getTitle()}
        breadcrumbs={[
          { title: t('account_section_payment.title'), path: ROUTES.TAXES },
          { title: detailPageTitle, path: detailPagePath },
          { title: getTitle(), path: null },
        ]}
      />
      <SectionContainer className="py-6 lg:py-12">
        {isIdentityVerified ? (
          showDeliveryMethodNeededBanner ? (
            <DeliveryMethodNeededBanner />
          ) : (
            <TaxPaymentData paymentMethod={paymentMethodParam} />
          )
        ) : isInQueue ? (
          <IdentityVerificationBanner variant="verification-in-process" />
        ) : (
          <IdentityVerificationBanner variant="verification-needed" />
        )}
      </SectionContainer>
    </div>
  )
}

export default TaxPaymentPageContent

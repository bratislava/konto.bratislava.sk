import { useTranslation } from 'next-i18next/pages'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import IdentityVerificationBanner from '@/src/components/page-contents/TaxesFees/shared/IdentityVerificationBanner'
import OfficialCorrespondenceChannelNeededBanner from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelNeededBanner'
import PaymentData from '@/src/components/page-contents/TaxesFees/TaxFeePaymentPageContent/PaymentData'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import { useUserDataDeliveryMethod } from '@/src/components/page-contents/TaxesFees/useUserDataDeliveryMethod'
import TaxFeePageHeader from '@/src/components/segments/PageHeader/TaxFeePageHeader'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { PaymentMethod } from '@/src/frontend/types/types'
import { ROUTES } from '@/src/utils/routes'

// query param "sposob-uhrady" could have "zvysna suma" split to "zvysna-suma" and "jednorazova-uhrada"
// but only thing that is affecting is title of the page
const TaxFeePaymentPageContent = () => {
  const { t } = useTranslation('account')

  const [paymentMethodParam] = useQueryState(
    'sposob-uhrady',
    parseAsStringLiteral([PaymentMethod.RemainingAmount, PaymentMethod.Installments] as const)
      .withDefault(PaymentMethod.RemainingAmount)
      .withOptions({ clearOnDefault: false }),
  )

  const { taxData } = useTaxFee()
  const isSinglePayment = taxData.overallAmount === taxData.overallBalance

  const { tierStatus } = useSsrAuth()
  const { isIdentityVerified, isInQueue } = tierStatus
  const { showChannelNeededBanner } = useUserDataDeliveryMethod()

  const getTitle = () => {
    switch (paymentMethodParam) {
      case PaymentMethod.Installments:
        return t('tax_detail_section.title_payment_installments')

      case PaymentMethod.RemainingAmount:
        return isSinglePayment
          ? t('tax_detail_section.title_payment_all')
          : t('tax_detail_section.title_payment_rest')

      default:
        return t('tax_detail_section.title_payment_all')
    }
  }

  const detailPageTitle = {
    [TaxType.Dzn]: t('tax_detail_section.title.dzn', { year: taxData.year }),
    [TaxType.Ko]: t('tax_detail_section.title.ko', { year: taxData.year, order: taxData.order }),
  }[taxData.type]

  const detailPagePath = ROUTES.TAXES_AND_FEES_DETAIL({
    year: taxData.year,
    type: taxData.type,
    order: taxData.order,
  })

  return (
    <div className="flex flex-col">
      <TaxFeePageHeader
        title={getTitle()}
        breadcrumbs={[
          { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
          { title: detailPageTitle, path: detailPagePath },
          { title: getTitle(), path: null },
        ]}
      />
      <SectionContainer className="py-6 lg:py-12">
        {isIdentityVerified ? (
          showChannelNeededBanner ? (
            <OfficialCorrespondenceChannelNeededBanner />
          ) : (
            <PaymentData paymentMethod={paymentMethodParam} />
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

export default TaxFeePaymentPageContent

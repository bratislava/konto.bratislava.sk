import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'

import SectionContainer from '@/src/components/layouts/SectionContainer'
import IdentityVerificationBanner from '@/src/components/page-contents/TaxesFees/shared/IdentityVerificationBanner'
import OfficialCorrespondenceChannelNeededBanner from '@/src/components/page-contents/TaxesFees/shared/OfficialCorrespondenceChannelNeededBanner'
import PaymentData from '@/src/components/page-contents/TaxesFees/TaxFeePaymentPageContent/PaymentData'
import { useOfficialCorrespondenceChannel } from '@/src/components/page-contents/TaxesFees/useOfficialCorrespondenceChannel'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import TaxFeePageHeader from '@/src/components/segments/PageHeader/TaxFeePageHeader'
import { useSsrAuth } from '@/src/frontend/hooks/useSsrAuth'
import { PaymentMethod, PaymentMethodType } from '@/src/frontend/types/types'
import { ROUTES } from '@/src/utils/routes'

// query param "sposob-uhrady" could have "zvysna suma" split to "zvysna-suma" and "jednorazova-uhrada"
// but only thing that is affecting is title of the page
const TaxFeePaymentPageContent = () => {
  const { t } = useTranslation('account')

  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType

  const { taxData } = useTaxFee()
  const isSinglePayment = taxData.overallAmount === taxData.overallBalance

  const { tierStatus } = useSsrAuth()
  const { isIdentityVerified, isInQueue } = tierStatus
  const { showChannelNeededBanner } = useOfficialCorrespondenceChannel()

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
      <SectionContainer>
        <div className="py-6 lg:py-12">
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
        </div>
      </SectionContainer>
    </div>
  )
}

export default TaxFeePaymentPageContent

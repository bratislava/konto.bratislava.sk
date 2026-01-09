import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import IdentityVerificationBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/IdentityVerificationBanner'
import OfficialCorrespondenceChannelNeededBanner from 'components/forms/segments/AccountSections/TaxesFees/shared/OfficialCorrespondenceChannelNeededBanner'
import PaymentData from 'components/forms/segments/AccountSections/TaxesFees/TaxFeePaymentSection/PaymentData'
import { useOfficialCorrespondenceChannel } from 'components/forms/segments/AccountSections/TaxesFees/useOfficialCorrespondenceChannel'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { ROUTES } from 'frontend/api/constants'
import { useSsrAuth } from 'frontend/hooks/useSsrAuth'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'

// query param "sposob-uhrady" could have "zvysna suma" split to "zvysna-suma" and "jednorazova-uhrada"
// but only thing that is affecting is title of the page
const TaxFeePaymentSection = () => {
  const { t } = useTranslation('account')

  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType

  const { taxData } = useTaxFeeSection()
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
      <TaxFeeSectionHeader
        title={getTitle()}
        breadcrumbs={[
          { title: t('account_section_payment.title'), path: ROUTES.TAXES_AND_FEES },
          { title: detailPageTitle, path: detailPagePath },
          { title: getTitle(), path: null },
        ]}
      />
      <div className="m-auto w-full max-w-(--breakpoint-lg) px-4 py-6 lg:px-0 lg:py-12">
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
    </div>
  )
}

export default TaxFeePaymentSection

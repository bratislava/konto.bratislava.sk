import TaxFeeSectionHeader from 'components/forms/segments/AccountSectionHeader/TaxFeeSectionHeader'
import { PaymentMethod, PaymentMethodType } from 'frontend/types/types'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import React from 'react'

import PaymentData from './PaymentData'
import TaxFooter from './TaxFooter'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxFeePayment = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxFeeSection()
  const searchParams = useSearchParams()
  const paymentMethodParam = searchParams.get('sposob-uhrady') as PaymentMethodType
  const isSinglePayment = taxData.overallAmount === taxData.overallBalance

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
  return (
    <div className="flex flex-col">
      <TaxFeeSectionHeader title={getTitle()} />
      <div className="m-auto flex w-full max-w-(--breakpoint-lg) flex-col items-center gap-6 py-6 lg:gap-12 lg:py-12">
        <PaymentData />
        <TaxFooter />
      </div>
    </div>
  )
}

export default TaxFeePayment

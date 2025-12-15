import cn from 'frontend/cn'
import { formatDate } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { InstallmentPaidStatusEnum } from 'openapi-clients/tax'
import React from 'react'

import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useTaxFeeSection } from '../segments/AccountSections/TaxesFees/useTaxFeeSection'

const PaymentSchedule = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  return (
    <div className="flex w-full flex-col rounded-lg border-2 border-gray-200 px-4 py-2 lg:px-6">
      {taxData.installmentPayment.installments?.map((installment, index) => {
        const isPaid =
          installment.status === InstallmentPaidStatusEnum.Paid ||
          installment.status === InstallmentPaidStatusEnum.OverPaid

        const formattedDate = formatDate(installment.dueDate)
        const translationMap = {
          0: t('tax_detail_section.installments.0', { date: formattedDate }),
          1: t('tax_detail_section.installments.1', { date: formattedDate }),
          2: t('tax_detail_section.installments.2', { date: formattedDate }),
          3: t('tax_detail_section.installments.3', { date: formattedDate }),
        }

        return (
          <div
            key={installment.installmentNumber}
            className="flex w-full flex-col justify-between py-4 not-last:border-b-2 not-last:border-gray-200 lg:flex-row"
          >
            <span className="text-h4">
              {/* only first installment is calculated, others are hardcoded so they will always be available for DzN,
               how date calculation works for PKO is not yet determined same in TaxFeePaymentMethodSection */}
              {installment.dueDate
                ? translationMap[index]
                : t('tax_detail_section.installments.not_available')}
            </span>
            <span
              className={cn({
                'text-p2-semibold text-success-700': isPaid,
              })}
            >
              {isPaid ? (
                t('tax_detail_section.tax_status.success')
              ) : (
                <FormatCurrencyFromCents value={installment.remainingAmount} />
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default PaymentSchedule

import cn from 'frontend/cn'
import { formatDate } from 'frontend/utils/general'
import { useTranslation } from 'next-i18next'
import { InstallmentPaidStatusEnum } from 'node_modules/openapi-clients/dist/tax/api'
import React from 'react'

import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useTaxFeeSection } from '../segments/AccountSections/TaxesFeesSection/useTaxFeeSection'

const PaymentSchedule = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  return (
    <div className="flex w-full flex-col rounded-lg border-2 border-gray-200 px-4 py-2 lg:px-6">
      {taxData.installmentPayment.installments?.map((installment, index) => {
        const isPaid =
          installment.status === InstallmentPaidStatusEnum.Paid ||
          installment.status === InstallmentPaidStatusEnum.OverPaid
        return (
          <div
            key={installment.installmentNumber}
            className="flex w-full flex-col justify-between py-4 not-last:border-b-2 not-last:border-gray-200 lg:flex-row"
          >
            <span className="text-h4">
              {t(`tax_detail_section.installments.${index}`, {
                date: formatDate(installment.dueDate),
              })}
            </span>
            <span
              className={cn('', {
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

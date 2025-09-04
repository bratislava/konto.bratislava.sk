import { useTranslation } from 'next-i18next'
import React from 'react'

import { FormatCurrencyFromCents } from '../../../frontend/utils/formatCurrency'
import { useTaxFeeSection } from '../segments/AccountSections/TaxesFeesSection/useTaxFeeSection'

const PaymentSchedule = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  return (
    <div className="flex w-full flex-col rounded-lg border-2 border-gray-200 px-6 py-2">
      {taxData.installmentPayment.installments?.map((installment, index) => (
        <div className="flex w-full justify-between py-4 not-last:border-b-2 not-last:border-gray-200">
          <span className="text-h4">
            {t(`tax_detail_section.installments.${index}`, {
              date: '1.4.2025',
              // date: installment.dueDate,
            })}
          </span>
          <span className="text-h4-semibold">
            {/* TODO: add amount when we have types from Jakub */}
            <FormatCurrencyFromCents value={1000} />
          </span>
        </div>
      ))}
    </div>
  )
}

export default PaymentSchedule

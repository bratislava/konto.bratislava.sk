import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { FormatCurrencyFromCents } from 'frontend/utils/formatCurrency'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React, { Fragment } from 'react'

import HorizontalDivider from '@/components/forms/HorizontalDivider'
import cn from '@/frontend/cn'

const TaxFeePaymentSummary = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')

  const overallAmountLabel = {
    [TaxType.Dzn]: t('taxes.tax_details.tax'),
    [TaxType.Ko]: t('taxes.tax_details.fee'),
  }[taxData.type]

  const rows = [
    {
      label: overallAmountLabel,
      value: taxData.overallAmount,
    },
    {
      label: t('tax_detail_section.tax_to_pay'),
      value: taxData.overallBalance,
      valueClassName: 'text-error',
    },
    {
      label: t('tax_detail_section.tax_already_paid'),
      value: taxData.overallPaid,
      valueClassName: 'text-success-700',
    },
  ]

  return (
    <ul className="flex w-full flex-col items-stretch rounded-lg border border-border-passive-primary bg-gray-50 px-5 py-2 lg:px-6">
      {rows.map(({ label, value, valueClassName }, index) => (
        <Fragment key={index}>
          {index > 0 && <HorizontalDivider asListItem className="max-lg:hidden" />}
          <li className="flex justify-between border-gray-200 py-1.5 lg:py-4">
            <span className="text-h5">{label}</span>
            <span className={cn('text-h5-semibold', valueClassName)}>
              <FormatCurrencyFromCents value={value} />
            </span>
          </li>
        </Fragment>
      ))}
    </ul>
  )
}

export default TaxFeePaymentSummary

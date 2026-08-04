import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'
import { Fragment } from 'react'

import { FormatCurrencyFromCents } from '@/src/components/formatting/formatCurrency'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import cn from '@/src/utils/cn'

const TaxPaymentSummary = () => {
  const { t } = useTranslation('account')

  const { taxData } = useTaxData()

  const overallAmountLabel = {
    [TaxType.Dzn]: t('TaxPaymentSummary.tax'),
    [TaxType.Ko]: t('TaxPaymentSummary.fee'),
  }[taxData.type]

  const rows = [
    {
      label: overallAmountLabel,
      value: taxData.overallAmount,
    },
    {
      label: t('TaxPaymentSummary.toPay'),
      value: taxData.overallBalance,
      valueClassName: 'text-error',
    },
    {
      label: t('TaxPaymentSummary.alreadyPaid'),
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
            <Typography variant="h5" as="span">
              {label}
            </Typography>
            <Typography variant="h5" as="span" className={cn('font-semibold', valueClassName)}>
              <FormatCurrencyFromCents value={value} />
            </Typography>
          </li>
        </Fragment>
      ))}
    </ul>
  )
}

export default TaxPaymentSummary

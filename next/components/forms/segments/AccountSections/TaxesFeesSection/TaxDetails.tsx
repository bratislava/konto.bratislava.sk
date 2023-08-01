import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { Tax } from '../../../../../frontend/dtos/taxDto'
import { formatCurrency } from '../../../../../frontend/utils/general'
import AccordionTableTaxContent from '../../../simple-components/AccordionTableTaxContent'

interface TaxDetailsProps {
  tax: Tax
}

const TaxDetails = ({ tax }: TaxDetailsProps) => {
  const { t } = useTranslation('account')

  const groupedTaxDetails = _.groupBy(tax.taxDetails, 'type')
  // TODO use data from root obj
  const sums = _.mapValues(groupedTaxDetails, (taxDetails) => {
    return _.reduce(
      taxDetails,
      (sum, taxDetail) => {
        return sum + taxDetail.amount
      },
      0,
    )
  })

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      <div className="text-h3">{t('tax_liability_breakdown')}</div>
      <div className="flex w-full flex-col gap-4">
        {Object.keys(groupedTaxDetails).map((key) => (
          <AccordionTableTaxContent
            key={key}
            size="md"
            dataType={key}
            title={t(`tax_detail_section.tax_type.${key}.title`)}
            secondTitle={formatCurrency(sums[key])}
            data={groupedTaxDetails[key]}
          />
        ))}
      </div>
      <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 lg:gap-6 lg:px-8 lg:py-6">
        <div className="flex w-full flex-col items-start gap-3 lg:gap-5">
          {Object.keys(groupedTaxDetails).map((key) => (
            <div className="flex w-full flex-row items-start gap-6" key={key}>
              <div className="text-p1 grow">{t(`tax_detail_section.tax_type.${key}.title`)}</div>
              <div className="text-p1">{formatCurrency(sums[key])}</div>
            </div>
          ))}
        </div>
        <div className="h-0.5 w-full bg-gray-200" />
        <div className="flex w-full flex-col items-start gap-3">
          <div className="flex w-full flex-col gap-1 xs:flex-row">
            <div className="text-p2 w-full grow xs:w-min">{t('tax_detail_section.tax_total')}</div>
            <div className="text-p2 w-max">{formatCurrency(tax.amount)}</div>
          </div>
          <div className="flex w-full flex-col gap-1 xs:flex-row">
            <div className="text-p2 w-full grow xs:w-min">
              {t('tax_detail_section.tax_already_paid')}
            </div>
            <div className="text-p2 w-max">{formatCurrency(tax.payedAmount)}</div>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gray-800" />
        <div className="flex w-full flex-col gap-2 xs:flex-row lg:gap-6">
          <div className="text-h4 w-full grow xs:w-min">{t('tax_detail_section.tax_to_pay')}</div>
          <div className="text-h4 w-max">{formatCurrency(tax.amount - tax.payedAmount)}</div>
        </div>
      </div>
    </div>
  )
}

export default TaxDetails

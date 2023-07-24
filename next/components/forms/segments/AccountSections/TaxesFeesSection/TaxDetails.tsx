import type { ResponseTaxDto } from '@clients/openapi-tax'
import _ from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { formatCurrency } from '../../../../../frontend/utils/general'
import AccordionTableTaxContent from '../../../simple-components/AccordionTableTaxContent'

interface TaxDetailsProps {
  tax: ResponseTaxDto
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
    <div className="flex flex-col items-start lg:gap-6 gap-3 w-full lg:px-0 px-4">
      <div className="text-h3">{t('tax_liability_breakdown')}</div>
      <div className="gap-4 flex flex-col w-full">
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
      <div className="rounded-lg flex flex-col items-start lg:px-8 lg:py-6 p-4 bg-gray-50 w-full lg:gap-6 gap-4">
        <div className="flex flex-col items-start lg:gap-5 gap-3 w-full">
          {Object.keys(groupedTaxDetails).map((key) => (
            <div className="flex flex-row items-start gap-6 w-full" key={key}>
              <div className="text-p1 grow">{t(`tax_detail_section.tax_type.${key}.title`)}</div>
              <div className="text-p1">{formatCurrency(sums[key])}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-200 h-0.5 w-full" />
        <div className="flex flex-col items-start gap-3 w-full">
          <div className="flex xs:flex-row flex-col gap-1 w-full">
            <div className="text-p2 grow xs:w-min w-full">{t('tax_detail_section.tax_total')}</div>
            <div className="text-p2 w-max">{formatCurrency(tax.amount)}</div>
          </div>
          <div className="flex xs:flex-row flex-col gap-1 w-full">
            <div className="text-p2 grow xs:w-min w-full">
              {t('tax_detail_section.tax_already_paid')}
            </div>
            <div className="text-p2 w-max">{formatCurrency(tax.payedAmount)}</div>
          </div>
        </div>
        <div className="bg-gray-800 h-0.5 w-full" />
        <div className="flex xs:flex-row flex-col lg:gap-6 gap-2 w-full">
          <div className="text-h4 grow xs:w-min w-full">{t('tax_detail_section.tax_to_pay')}</div>
          <div className="text-h4 w-max">{formatCurrency(tax.amount - tax.payedAmount)}</div>
        </div>
      </div>
    </div>
  )
}

export default TaxDetails

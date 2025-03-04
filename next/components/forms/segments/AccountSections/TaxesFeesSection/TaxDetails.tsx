import groupBy from 'lodash/groupBy'
import mapValues from 'lodash/mapValues'
import reduce from 'lodash/reduce'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  FormatCurrencyFromCents,
  useCurrencyFromCentsFormatter,
} from '../../../../../frontend/utils/formatCurrency'
import AccordionTableTaxContent from '../../../simple-components/AccordionTableTaxContent'
import { useTaxFeeSection } from './useTaxFeeSection'

const TaxDetails = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()

  const groupedTaxDetails = groupBy(taxData.taxDetails, 'type')
  // TODO use data from root obj
  const sums = mapValues(groupedTaxDetails, (taxDetails) => {
    return reduce(
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
        {Object.keys(groupedTaxDetails).map((key) => {
          return (
            <AccordionTableTaxContent
              key={key}
              dataType={key}
              title={t(`tax_detail_section.tax_type.${key}.title`)}
              secondTitle={currencyFromCentsFormatter.format(sums[key])}
              data={groupedTaxDetails[key]}
            />
          )
        })}
      </div>
      <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-gray-50 p-4 lg:gap-6 lg:px-8 lg:py-6">
        <div className="flex w-full flex-col items-start gap-3 lg:gap-5">
          {Object.keys(groupedTaxDetails).map((key) => (
            <div className="flex w-full flex-row items-start gap-6" key={key}>
              <div className="text-p2 grow">{t(`tax_detail_section.tax_type.${key}.title`)}</div>
              <div className="text-p2">
                <FormatCurrencyFromCents value={sums[key]} />
              </div>
            </div>
          ))}
        </div>
        <div className="h-0.5 w-full bg-gray-200" />
        <div className="flex w-full flex-col items-start gap-3">
          <div className="xs:flex-row flex w-full flex-col gap-1">
            <div className="text-p2 xs:w-min w-full grow">{t('tax_detail_section.tax_total')}</div>
            <div className="text-p2 w-max">
              <FormatCurrencyFromCents value={taxData.amount} />
            </div>
          </div>
          <div className="xs:flex-row flex w-full flex-col gap-1">
            <div className="text-p2 xs:w-min w-full grow">
              {t('tax_detail_section.tax_already_paid')}
            </div>
            <div className="text-p2 w-max">
              <FormatCurrencyFromCents value={taxData.paidAmount} />
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full bg-gray-800" />
        <div className="xs:flex-row flex w-full flex-col gap-2 lg:gap-6">
          <div className="text-h4 xs:w-min w-full grow">{t('tax_detail_section.tax_to_pay')}</div>
          <div className="text-h4 w-max">
            <FormatCurrencyFromCents value={taxData.amount - taxData.paidAmount} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaxDetails

import { ExportIcon } from '@assets/ui-icons'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
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
  // change for taxData after Jakub chenges types
  const { taxData, taxDataOld } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()
  console.log('taxData.itemizedDetail', taxData.itemizedDetail)

  // implement when fixed types
  // console.log('taxData', "get-tax-detail-by-year".data.itemizedDetail[0].apartmentTotalAmount)
  // console.log('taxData', taxData.itemizedDetail[0].apartmentTotalAmount)
  // console.log('taxData', taxData.itemizedDetail[0].constructionTotalAmount)
  // console.log('taxData', taxData.itemizedDetail[0].groundTaxDetail)
  const groupedTaxDetails = groupBy(taxDataOld.taxDetails, 'type')
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
      <div className="flex w-full justify-between">
        <span className="text-h3">{t('tax_liability_breakdown')}</span>
        <div className="flex items-center justify-between gap-2">
          <ButtonNew
            href="https://bratislava.sk/mesto-bratislava/dane-a-poplatky/dan-z-nehnutelnosti"
            variant="black-link"
            endIcon={<ExportIcon />}
          >
            {t('tax_detail_section.tax_detail_fees_link')}
          </ButtonNew>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        {/* this requires complex changes to the accordion component which is used by multiple components */}
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
      <div className="flex w-full flex-col rounded-lg border-2 border-gray-200 bg-gray-100 px-6 py-2">
        <div className="flex w-full justify-between border-b-2 border-gray-200 py-4">
          <span className="text-h4">{t('tax')}</span>
          <span className="text-h4-semibold">
            <FormatCurrencyFromCents value={taxData.overallAmount} />
          </span>
        </div>
        <div className="flex w-full justify-between border-b-2 border-gray-200 py-4">
          <span className="text-h4">{t('tax_detail_section.tax_to_pay')}</span>
          <span className="text-h4-semibold text-error">
            <FormatCurrencyFromCents value={taxData.overallBalance} />
          </span>
        </div>
        <div className="flex w-full justify-between py-4">
          <span className="text-h4">{t('tax_detail_section.tax_already_paid')}</span>
          <span className="text-h4-semibold text-success-700">
            <FormatCurrencyFromCents value={taxData.overallPaid} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default TaxDetails

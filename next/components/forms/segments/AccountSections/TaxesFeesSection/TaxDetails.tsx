import { ExportIcon } from '@assets/ui-icons'
import ButtonNew from 'components/forms/simple-components/ButtonNew'
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

  return (
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      <div className="flex w-full flex-col justify-between gap-3 lg:flex-row">
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
        <AccordionTableTaxContent
          dataType="APARTMENT"
          title={t(`tax_detail_section.tax_type.APARTMENT.title`)}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.apartmentTotalAmount,
          )}
          data={taxData.itemizedDetail.apartmentTaxDetail}
        />
        <AccordionTableTaxContent
          dataType="GROUND"
          title={t(`tax_detail_section.tax_type.GROUND.title`)}
          secondTitle={currencyFromCentsFormatter.format(taxData.itemizedDetail.groundTotalAmount)}
          data={taxData.itemizedDetail.groundTaxDetail}
        />
        <AccordionTableTaxContent
          dataType="CONSTRUCTION"
          title={t(`tax_detail_section.tax_type.CONSTRUCTION.title`)}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.constructionTotalAmount,
          )}
          data={taxData.itemizedDetail.constructionTaxDetail}
        />
      </div>
      <div className="flex w-full flex-col rounded-lg border-gray-200 bg-gray-100 px-6 py-2 lg:border-2">
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

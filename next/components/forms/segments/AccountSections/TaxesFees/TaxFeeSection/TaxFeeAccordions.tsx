import KoAccordionTableTaxContent from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/KoAccordionTableTaxContent'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'

import DznAccordionTableTaxContent from '@/components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/DznAccordionTableTaxContent'
import { useCurrencyFromCentsFormatter } from '@/frontend/utils/formatCurrency'

const TaxFeeAccordions = () => {
  const { taxData } = useTaxFeeSection()
  const { t } = useTranslation('account')
  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()

  if (taxData.type === TaxType.Dzn)
    return (
      <div className="flex w-full flex-col gap-4">
        <DznAccordionTableTaxContent
          dataType="APARTMENT"
          title={t('tax_detail_section.tax_type.APARTMENT.title')}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.apartmentTotalAmount,
          )}
          data={taxData.itemizedDetail.apartmentTaxDetail}
        />
        <DznAccordionTableTaxContent
          dataType="GROUND"
          title={t('tax_detail_section.tax_type.GROUND.title')}
          secondTitle={currencyFromCentsFormatter.format(taxData.itemizedDetail.groundTotalAmount)}
          data={taxData.itemizedDetail.groundTaxDetail}
        />
        <DznAccordionTableTaxContent
          dataType="CONSTRUCTION"
          title={t('tax_detail_section.tax_type.CONSTRUCTION.title')}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.constructionTotalAmount,
          )}
          data={taxData.itemizedDetail.constructionTaxDetail}
        />
      </div>
    )
  if (taxData.type === TaxType.Ko) {
    return (
      <div className="flex w-full flex-col gap-4">
        {taxData.itemizedDetail.addressDetail.map((item, index) => {
          return (
            <KoAccordionTableTaxContent
              key={index}
              title={`${item.address.street} ${item.address.orientationNumber}`}
              secondTitle={currencyFromCentsFormatter.format(item.totalAmount)}
              data={item.itemizedContainers}
            />
          )
        })}
      </div>
    )
  }
  return null
}

export default TaxFeeAccordions

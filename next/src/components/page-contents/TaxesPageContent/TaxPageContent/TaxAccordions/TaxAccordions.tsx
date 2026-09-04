import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import { useCurrencyFromCentsFormatter } from '@/src/components/formatting/formatCurrency'
import DznAccordionContent from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/DznAccordionContent'
import KoAccordionContent from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/KoAccordionContent'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'

const TaxAccordions = () => {
  const { t } = useTranslation()

  const { taxData } = useTaxData()
  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()

  if (taxData.type === TaxType.Dzn) {
    return (
      <div className="flex w-full flex-col gap-4">
        <DznAccordionContent
          dataType="APARTMENT"
          title={t('TaxAccordions.taxTypes.APARTMENT')}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.apartmentTotalAmount,
          )}
          data={taxData.itemizedDetail.apartmentTaxDetail}
        />
        <DznAccordionContent
          dataType="GROUND"
          title={t('TaxAccordions.taxTypes.GROUND')}
          secondTitle={currencyFromCentsFormatter.format(taxData.itemizedDetail.groundTotalAmount)}
          data={taxData.itemizedDetail.groundTaxDetail}
        />
        <DznAccordionContent
          dataType="CONSTRUCTION"
          title={t('TaxAccordions.taxTypes.CONSTRUCTION')}
          secondTitle={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.constructionTotalAmount,
          )}
          data={taxData.itemizedDetail.constructionTaxDetail}
        />
      </div>
    )
  }

  if (taxData.type === TaxType.Ko) {
    return (
      <div className="flex w-full flex-col gap-4">
        {taxData.itemizedDetail.addressDetail.map((item, index) => {
          return (
            <KoAccordionContent
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

export default TaxAccordions

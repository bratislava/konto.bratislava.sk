import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import { useCurrencyFromCentsFormatter } from '@/src/components/formatting/formatCurrency'
import DznAccordionContent from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/DznAccordionContent'
import KoAccordionContent from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/KoAccordionContent'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import DisclosureGroup from '@/src/components/simple-components/Disclosure/DisclosureGroup'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9902&m=dev
 */
const TaxAccordions = () => {
  const { t } = useTranslation()

  const { taxData } = useTaxData()
  const currencyFromCentsFormatter = useCurrencyFromCentsFormatter()

  if (taxData.type === TaxType.Dzn) {
    return (
      <DisclosureGroup>
        <DznAccordionContent
          dataType="APARTMENT"
          title={t('TaxAccordions.taxTypes.APARTMENT')}
          taxAmountString={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.apartmentTotalAmount,
          )}
          data={taxData.itemizedDetail.apartmentTaxDetail}
        />
        <DznAccordionContent
          dataType="GROUND"
          title={t('TaxAccordions.taxTypes.GROUND')}
          taxAmountString={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.groundTotalAmount,
          )}
          data={taxData.itemizedDetail.groundTaxDetail}
        />
        <DznAccordionContent
          dataType="CONSTRUCTION"
          title={t('TaxAccordions.taxTypes.CONSTRUCTION')}
          taxAmountString={currencyFromCentsFormatter.format(
            taxData.itemizedDetail.constructionTotalAmount,
          )}
          data={taxData.itemizedDetail.constructionTaxDetail}
        />
      </DisclosureGroup>
    )
  }

  if (taxData.type === TaxType.Ko) {
    return (
      <DisclosureGroup>
        {taxData.itemizedDetail.addressDetail.map((item, index) => {
          return (
            <KoAccordionContent
              key={index}
              title={`${item.address.street} ${item.address.orientationNumber}`}
              taxAmountString={currencyFromCentsFormatter.format(item.totalAmount)}
              data={item.itemizedContainers}
            />
          )
        })}
      </DisclosureGroup>
    )
  }

  return null
}

export default TaxAccordions

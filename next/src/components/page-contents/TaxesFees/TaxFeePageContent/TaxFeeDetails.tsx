import { Button } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'

import { ExportIcon } from '@/src/assets/ui-icons'
import TaxFeeAccordions from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeeAccordions'
import TaxFeePaymentSummary from '@/src/components/page-contents/TaxesFees/TaxFeePageContent/TaxFeePaymentSummary'
import { useTaxFee } from '@/src/components/page-contents/TaxesFees/useTaxFee'
import { EXTERNAL_LINKS } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9194&t=Ccb3STSCmoifklgW-4
 */

const TaxFeeDetails = () => {
  const { t } = useTranslation('account')
  const { taxData } = useTaxFee()

  const taxFeeAccordionsHeader = {
    [TaxType.Dzn]: t('taxes.tax_details.tax_liability_breakdown.taxes'),
    [TaxType.Ko]: t('taxes.tax_details.tax_liability_breakdown.fees'),
  }[taxData.type]

  const taxFeeAccordionsHeaderLinkProps = {
    [TaxType.Dzn]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_DZN,
      children: t('tax_detail_section.tax_detail_fees_link.dzn'),
    },
    [TaxType.Ko]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_AND_FEES_INFO_KO,
      children: t('tax_detail_section.tax_detail_fees_link.ko'),
    },
  }[taxData.type]

  return (
    <div className="flex w-full flex-col items-start gap-3 lg:gap-6">
      <div className="flex w-full flex-col justify-between lg:flex-row">
        <span className="text-h5">{taxFeeAccordionsHeader}</span>
        <Button variant="link" endIcon={<ExportIcon />} {...taxFeeAccordionsHeaderLinkProps} />
      </div>
      <TaxFeeAccordions />
      <TaxFeePaymentSummary />
    </div>
  )
}

export default TaxFeeDetails

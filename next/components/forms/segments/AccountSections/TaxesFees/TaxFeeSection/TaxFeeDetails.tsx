import { ExportIcon } from '@assets/ui-icons'
import TaxFeeAccordions from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeeAccordions'
import TaxFeePaymentSummary from 'components/forms/segments/AccountSections/TaxesFees/TaxFeeSection/TaxFeePaymentSummary'
import { useTaxFeeSection } from 'components/forms/segments/AccountSections/TaxesFees/useTaxFeeSection'
import ButtonNew from 'components/forms/simple-components/Button'
import { EXTERNAL_LINKS } from 'frontend/api/constants'
import { useTranslation } from 'next-i18next'
import { TaxType } from 'openapi-clients/tax'
import React from 'react'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9194&t=Ccb3STSCmoifklgW-4
 */

const TaxFeeDetails = () => {
  const { t } = useTranslation('account')
  const { taxData } = useTaxFeeSection()

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
    <div className="flex w-full flex-col items-start gap-3 px-4 lg:gap-6 lg:px-0">
      <div className="flex w-full flex-col justify-between lg:flex-row">
        <span className="text-h5">{taxFeeAccordionsHeader}</span>
        <ButtonNew
          variant="black-link"
          endIcon={<ExportIcon />}
          {...taxFeeAccordionsHeaderLinkProps}
        />
      </div>
      <TaxFeeAccordions />
      <TaxFeePaymentSummary />
    </div>
  )
}

export default TaxFeeDetails

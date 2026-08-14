import { Button, Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TaxType } from 'openapi-clients/tax'

import Icon from '@/src/components/icon-components/Icon'
import TaxAccordions from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxAccordions/TaxAccordions'
import TaxPaymentSummary from '@/src/components/page-contents/TaxesPageContent/TaxPageContent/TaxPaymentSummary'
import { useTaxData } from '@/src/components/page-contents/TaxesPageContent/useTaxData'
import { EXTERNAL_LINKS } from '@/src/utils/routes'

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=20611-9194&t=Ccb3STSCmoifklgW-4
 */

const TaxDetails = () => {
  const { t } = useTranslation()

  const { taxData } = useTaxData()

  const taxAccordionsHeader = {
    [TaxType.Dzn]: t('TaxDetails.breakdown.taxes'),
    [TaxType.Ko]: t('TaxDetails.breakdown.fees'),
  }[taxData.type]

  const taxAccordionsHeaderLinkProps = {
    [TaxType.Dzn]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_INFO_DZN,
      children: t('TaxDetails.feesLink.dzn'),
    },
    [TaxType.Ko]: {
      href: EXTERNAL_LINKS.BRATISLAVA_TAXES_INFO_KO,
      children: t('TaxDetails.feesLink.ko'),
    },
  }[taxData.type]

  return (
    <div className="flex w-full flex-col items-start gap-3 lg:gap-6">
      <div className="flex w-full flex-col justify-between lg:flex-row">
        <Typography variant="h5" as="p" className="font-semibold">
          {taxAccordionsHeader}
        </Typography>
        <Button variant="link" endIcon={<Icon name="export" />} {...taxAccordionsHeaderLinkProps} />
      </div>
      <TaxAccordions />
      <TaxPaymentSummary />
    </div>
  )
}

export default TaxDetails

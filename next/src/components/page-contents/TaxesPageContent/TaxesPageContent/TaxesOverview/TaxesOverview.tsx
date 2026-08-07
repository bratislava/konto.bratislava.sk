import { Typography } from '@bratislava/component-library'
import { useTranslation } from 'next-i18next/pages'
import { TaxAvailabilityStatus, TaxType } from 'openapi-clients/tax'
import { Fragment } from 'react'

import DznTaxFormAlert from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesOverview/DznTaxFormAlert'
import TaxesOverviewBanner from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesOverview/TaxesOverviewBanner'
import TaxesOverviewRow from '@/src/components/page-contents/TaxesPageContent/TaxesPageContent/TaxesOverview/TaxesOverviewRow'
import HorizontalDivider from '@/src/components/simple-components/HorizontalDivider'
import { TaxesData } from '@/src/pages/dane-a-poplatky'

type Props = {
  taxType: TaxType
  taxesData: TaxesData | null
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-6275&m=dev
 */

const TaxesOverview = ({ taxesData, taxType }: Props) => {
  const { t } = useTranslation()

  const title = {
    [TaxType.Dzn]: t('TaxesOverview.title.tax'),
    [TaxType.Ko]: t('TaxesOverview.title.fee'),
  }[taxType]

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h5" as="h2">
        {title}
      </Typography>
      {taxesData?.availabilityStatus === TaxAvailabilityStatus.LookingForYourTax ? (
        <TaxesOverviewBanner taxType={taxType} variant="looking-for" />
      ) : taxesData?.availabilityStatus === TaxAvailabilityStatus.TaxNotOnRecord ? (
        <TaxesOverviewBanner taxType={taxType} variant="no-results" />
      ) : taxesData?.availabilityStatus === TaxAvailabilityStatus.Available ? (
        <ul className="flex flex-col rounded-lg border border-gray-200 px-4 lg:px-6">
          {taxesData.items.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && <HorizontalDivider asListItem />}
              <li>
                <TaxesOverviewRow taxData={item} />
              </li>
            </Fragment>
          ))}
        </ul>
      ) : null}
      {taxType === TaxType.Dzn && <DznTaxFormAlert />}
    </div>
  )
}

export default TaxesOverview

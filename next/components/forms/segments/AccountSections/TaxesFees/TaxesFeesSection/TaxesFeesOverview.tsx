import HorizontalDivider from 'components/forms/HorizontalDivider'
import DznTaxFormAlert from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/DznTaxFormAlert'
import TaxFeeRow from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesCard/TaxFeeRow'
import TaxesFeesOverviewBanner from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesOverviewBanner'
import { useTranslation } from 'next-i18next'
import { TaxAvailabilityStatus, TaxType } from 'openapi-clients/tax'
import { TaxesData } from 'pages/dane-a-poplatky'

type Props = {
  taxType: TaxType
  taxesData: TaxesData | null
}

/**
 * Figma: https://www.figma.com/design/17wbd0MDQcMW9NbXl6UPs8/DS--Component-library?node-id=19579-6275&m=dev
 */

const TaxesFeesOverview = ({ taxesData, taxType }: Props) => {
  const { t } = useTranslation('account')

  const title = {
    [TaxType.Dzn]: t('account_section_payment.tax_overview_title.tax'),
    [TaxType.Ko]: t('account_section_payment.tax_overview_title.fee'),
  }[taxType]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h5-semibold">{title}</h2>
      {taxesData?.availabilityStatus === TaxAvailabilityStatus.LookingForYourTax ? (
        <TaxesFeesOverviewBanner taxType={taxType} variant="lookingFor" />
      ) : taxesData?.availabilityStatus === TaxAvailabilityStatus.TaxNotOnRecord ? (
        <TaxesFeesOverviewBanner taxType={taxType} variant="noResults" />
      ) : taxesData?.availabilityStatus === TaxAvailabilityStatus.Available ? (
        <ul className="flex flex-col rounded-lg border border-gray-200 px-4 lg:px-6">
          {taxesData.items.map((item, index) => (
            <>
              {index > 0 && <HorizontalDivider asListItem />}
              <li key={index}>
                <TaxFeeRow taxData={item} />
              </li>
            </>
          ))}
        </ul>
      ) : null}
      {taxType === TaxType.Dzn && <DznTaxFormAlert />}
    </div>
  )
}

export default TaxesFeesOverview

import { StrapiTaxAdministrator } from '@backend/utils/strapi-tax-administrator'
import TaxesFeesAdministratorCardWrapper from 'components/forms/segments/AccountSections/TaxesFees/shared/TaxesFeesAdministratorCard/TaxesFeesAdministratorCardWrapper'
import TaxesFeesCard from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesCard/TaxesFeesCard'
import TaxesFeesErrorCard from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesErrorCard'
import TaxesFeesSearchingCard from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxesFeesSearchingCard'
import TaxFormAlert from 'components/forms/segments/AccountSections/TaxesFees/TaxesFeesSection/TaxFormAlert'
import { useTranslation } from 'next-i18next'
import { TaxAvailabilityStatus } from 'openapi-clients/tax'
import { AccountTaxesFeesPageProps } from 'pages/dane-a-poplatky'

type Props = {
  taxesData: AccountTaxesFeesPageProps['taxesData'] | null
  strapiTaxAdministrator: StrapiTaxAdministrator | null
}

const TaxesFeesOverview = ({ taxesData, strapiTaxAdministrator }: Props) => {
  const { t } = useTranslation('account')

  const taxesDataAvailable = taxesData?.availabilityStatus === TaxAvailabilityStatus.Available
  const taxesDataNotOnRecord =
    taxesData?.availabilityStatus === TaxAvailabilityStatus.TaxNotOnRecord

  const displayTaxesLookingFor =
    taxesData?.availabilityStatus === TaxAvailabilityStatus.LookingForYourTax

  return (
    <div className="flex flex-col gap-4">
      {(taxesData?.taxAdministrator || strapiTaxAdministrator) && (
        <TaxesFeesAdministratorCardWrapper
          beTaxAdministrator={taxesData?.taxAdministrator ?? null}
          strapiTaxAdministrator={strapiTaxAdministrator}
        />
      )}
      <h2 className="text-h5-semibold">{t('account_section_payment.tax_overview_title')}</h2>
      {displayTaxesLookingFor && <TaxesFeesSearchingCard />}
      {taxesDataNotOnRecord && <TaxesFeesErrorCard />}
      {taxesDataAvailable && (
        <ul className="flex flex-col rounded-lg border-2 border-gray-200">
          {taxesData.items.map((item, index) => (
            <li key={index} className="mx-4 not-last:border-b-2 not-last:border-gray-200 lg:mx-6">
              <TaxesFeesCard taxData={item} />
            </li>
          ))}
        </ul>
      )}
      <TaxFormAlert />
    </div>
  )
}

export default TaxesFeesOverview

import { strapiClient } from '@clients/graphql-strapi'
import { MunicipalServiceEntityFragment } from '@clients/graphql-strapi/api'
import MunicipalServicesSection, {
  MunicipalServicesSectionProps,
} from 'components/forms/segments/AccountSections/MunicipalServicesSection/MunicipalServicesSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { uniqBy } from 'lodash'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { isDefined } from '../frontend/utils/general'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type AccountMunicipalServicesPageProps = MunicipalServicesSectionProps

const extractAndSortCategories = (services: MunicipalServiceEntityFragment[]) => {
  const collator = new Intl.Collator('sk')
  const categoriesWithDuplicates = (
    services.flatMap((service) => service.attributes?.categories?.data) ?? []
  )
    .filter(isDefined)
    .filter((category) => category.attributes)
    .toSorted((a, b) => collator.compare(a.attributes!.title, b.attributes!.title))
  // eslint-disable-next-line lodash/prop-shorthand
  return uniqBy(categoriesWithDuplicates, (category) => category.id)
}

export const getServerSideProps = amplifyGetServerSideProps<AccountMunicipalServicesPageProps>(
  async () => {
    const municipalServicesPageQuery = await strapiClient.MunicipalServicesPage()
    const municipalServicesPage = municipalServicesPageQuery.municipalServicesPage?.data?.attributes

    if (!municipalServicesPage) {
      return {
        notFound: true,
      }
    }

    const services = municipalServicesPage.services?.data ?? []
    const categories = extractAndSortCategories(services)
    const servicesLegalPerson = municipalServicesPage.servicesLegalPerson?.data ?? []
    const categoriesLegalPerson = extractAndSortCategories(servicesLegalPerson)

    return {
      props: {
        services,
        categories,
        servicesLegalPerson,
        categoriesLegalPerson,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

const AccountMunicipalServicesPage = ({
  services,
  categories,
  servicesLegalPerson,
  categoriesLegalPerson,
}: AccountMunicipalServicesPageProps) => {
  return (
    <AccountPageLayout>
      <MunicipalServicesSection
        services={services}
        categories={categories}
        servicesLegalPerson={servicesLegalPerson}
        categoriesLegalPerson={categoriesLegalPerson}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

import { uniqBy } from 'lodash'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import MunicipalServicesPageContent, {
  MunicipalServicesPageContentProps,
} from '@/src/components/page-contents/MunicipalServicesPageContent/MunicipalServicesPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isDefined } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountMunicipalServicesPageProps = MunicipalServicesPageContentProps

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
    <PageLayout>
      <MunicipalServicesPageContent
        services={services}
        categories={categories}
        servicesLegalPerson={servicesLegalPerson}
        categoriesLegalPerson={categoriesLegalPerson}
      />
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

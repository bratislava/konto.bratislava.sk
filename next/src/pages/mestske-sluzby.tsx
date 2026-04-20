import { uniqBy } from 'lodash'

import { strapiClient } from '@/src/clients/graphql-strapi'
import { GeneralQuery, MunicipalServiceEntityFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { GeneralContextProvider } from '@/src/components/logic/GeneralContextProvider'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import MunicipalServicesPageContent, {
  MunicipalServicesPageContentProps,
} from '@/src/components/page-contents/MunicipalServicesPageContent/MunicipalServicesPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { isDefined } from '@/src/frontend/utils/general'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

type AccountMunicipalServicesPageProps = MunicipalServicesPageContentProps & {
  general: GeneralQuery
}

const extractAndSortCategories = (services: MunicipalServiceEntityFragment[]) => {
  const collator = new Intl.Collator('sk')
  const categoriesWithDuplicates = services
    .flatMap((service) => service.categories)
    .filter(isDefined)
    .toSorted((a, b) => collator.compare(a.title, b.title))

  return uniqBy(categoriesWithDuplicates, (category) => category.documentId)
}

export const getServerSideProps = amplifyGetServerSideProps<AccountMunicipalServicesPageProps>(
  async () => {
    const [general, municipalServicesPageQuery] = await Promise.all([
      strapiClient.General(),
      strapiClient.MunicipalServicesPage(),
    ])
    const municipalServicesPage = municipalServicesPageQuery.municipalServicesPage

    if (!municipalServicesPage) {
      return {
        notFound: true,
      }
    }

    const services = municipalServicesPage.services.filter(isDefined)
    const categories = extractAndSortCategories(services)
    const servicesLegalPerson = municipalServicesPage.servicesLegalPerson.filter(isDefined)
    const categoriesLegalPerson = extractAndSortCategories(servicesLegalPerson)

    return {
      props: {
        general,
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
  general,
  services,
  categories,
  servicesLegalPerson,
  categoriesLegalPerson,
}: AccountMunicipalServicesPageProps) => {
  return (
    <GeneralContextProvider general={general}>
      <PageLayout>
        <MunicipalServicesPageContent
          services={services}
          categories={categories}
          servicesLegalPerson={servicesLegalPerson}
          categoriesLegalPerson={categoriesLegalPerson}
        />
      </PageLayout>
    </GeneralContextProvider>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

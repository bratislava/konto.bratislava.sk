import { strapiClient } from '@clients/graphql-strapi'
import { MunicipalServiceFragment } from '@clients/graphql-strapi/api'
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

export const getServerSideProps = amplifyGetServerSideProps<AccountMunicipalServicesPageProps>(
  async () => {
    const municipalServicesPageQuery = await strapiClient.MunicipalServicesPage()
    const municipalServicesPage =
      municipalServicesPageQuery?.municipalServicesPage?.data?.attributes

    if (!municipalServicesPage) {
      return {
        notFound: true,
      }
    }

    const x = (services: MunicipalServiceFragment[]) => {
      const collator = new Intl.Collator('sk')
      const categoriesWithDuplicates = (
        services?.map((service) => service?.attributes?.category!.data) ?? []
      )
        .filter(isDefined)
        .toSorted((a, b) => collator.compare(a.attributes!.title, b.attributes!.title))
      const categories = uniqBy(categoriesWithDuplicates, (category) => category.id)

      return {
        services,
        categories,
      }
    }

    const services = x(municipalServicesPage.services?.data ?? [])
    const servicesLegalPerson = x(municipalServicesPage.servicesLegalPerson?.data ?? [])

    return {
      props: {
        services,
        servicesLegalPerson,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

const AccountMunicipalServicesPage = ({
  services,
  servicesLegalPerson,
}: AccountMunicipalServicesPageProps) => {
  return (
    <AccountPageLayout>
      <MunicipalServicesSection services={services} servicesLegalPerson={servicesLegalPerson} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

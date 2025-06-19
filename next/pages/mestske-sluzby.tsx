import { strapiClient } from '@clients/graphql-strapi'
import { MunicipalServicesPageFragment } from '@clients/graphql-strapi/api'
import MunicipalServicesSection from 'components/forms/segments/AccountSections/MunicipalServicesSection/MunicipalServicesSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import uniq from 'lodash/uniq'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { isDefined } from '../frontend/utils/general'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type AccountMunicipalServicesPageProps = {
  municipalServicesPage: MunicipalServicesPageFragment
  categories: string[]
}

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

    const collator = new Intl.Collator('sk')
    const categoriesWithDuplicates = (
      municipalServicesPage.services?.map(
        (service) => service?.category?.data?.attributes?.title,
      ) ?? []
    )
      .filter(isDefined)
      .toSorted((a, b) => collator.compare(a, b))
    const categories = uniq(categoriesWithDuplicates)

    return {
      props: {
        municipalServicesPage,
        categories,
        ...(await slovakServerSideTranslations()),
      },
    }
  },
)

const AccountMunicipalServicesPage = ({
  municipalServicesPage,
  categories,
}: AccountMunicipalServicesPageProps) => {
  return (
    <AccountPageLayout>
      <MunicipalServicesSection
        municipalServicesPage={municipalServicesPage}
        categories={categories}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

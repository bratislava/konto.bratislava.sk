import { strapiClient } from '@clients/graphql-strapi'
import { BannerHomepageFragment, MunicipalServiceFragment } from '@clients/graphql-strapi/api'
import IntroSection from 'components/forms/segments/AccountSections/IntroSection/IntroSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { isDefined } from 'frontend/utils/general'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps<AccountIntroPageProps>(async () => {
  const municipalServicesPageQuery = await strapiClient.Homepage()
  const services =
    municipalServicesPageQuery.homepage!.data!.attributes!.services!.data!.filter(isDefined)
  const servicesLegalPerson =
    municipalServicesPageQuery.homepage!.data!.attributes!.servicesLegalPerson!.data!.filter(
      isDefined,
    )
  const now = new Date()
  const filterBanners = (banners: BannerHomepageFragment[]) => {
    return banners
      .filter((banner) => {
        const dateFrom = banner.attributes!.dateFrom ? new Date(banner.attributes!.dateFrom) : null
        const dateTo = banner.attributes!.dateTo ? new Date(banner.attributes!.dateTo) : null

        const isAfterStart = !dateFrom || now >= dateFrom
        const isBeforeEnd = !dateTo || now <= dateTo

        return isAfterStart && isBeforeEnd
      })
      .slice(0, 3)
  }
  const banners = filterBanners(
    municipalServicesPageQuery.homepage!.data!.attributes!.banners!.data,
  )
  const bannersLegalPerson = filterBanners(
    municipalServicesPageQuery.homepage!.data!.attributes!.bannersLegalPerson!.data,
  )

  return {
    props: {
      services,
      servicesLegalPerson,
      banners,
      bannersLegalPerson,
      ...(await slovakServerSideTranslations()),
    },
  }
})

type AccountIntroPageProps = {
  services: MunicipalServiceFragment[]
  servicesLegalPerson: MunicipalServiceFragment[]
  banners: BannerHomepageFragment[]
  bannersLegalPerson: BannerHomepageFragment[]
}

const AccountIntroPage = ({
  services,
  servicesLegalPerson,
  banners,
  bannersLegalPerson,
}: AccountIntroPageProps) => {
  return (
    <AccountPageLayout>
      <IntroSection
        services={services}
        servicesLegalPerson={servicesLegalPerson}
        banners={banners}
        bannersLegalPerson={bannersLegalPerson}
      />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)

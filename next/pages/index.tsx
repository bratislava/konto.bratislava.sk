import { strapiClient } from '@clients/graphql-strapi'
import { MunicipalServiceCardEntityFragment } from '@clients/graphql-strapi/api'
import IntroSection from 'components/forms/segments/AccountSections/IntroSection/IntroSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import { isDefined } from 'frontend/utils/general'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps<AccountIntroPageProps>(async () => {
  const homepageQuery = await strapiClient.Homepage()
  const services = homepageQuery.homepage?.data?.attributes?.services?.data.filter(isDefined) ?? []
  const servicesLegalPerson =
    homepageQuery.homepage?.data?.attributes?.servicesLegalPerson?.data.filter(isDefined) ?? []

  return {
    props: {
      services,
      servicesLegalPerson,
      ...(await slovakServerSideTranslations()),
    },
  }
})

type AccountIntroPageProps = {
  services: MunicipalServiceCardEntityFragment[]
  servicesLegalPerson: MunicipalServiceCardEntityFragment[]
}

const AccountIntroPage = ({ services, servicesLegalPerson }: AccountIntroPageProps) => {
  return (
    <AccountPageLayout>
      <IntroSection services={services} servicesLegalPerson={servicesLegalPerson} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountIntroPage)

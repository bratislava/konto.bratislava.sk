import MunicipalServicesSection from 'components/forms/segments/AccountSections/MunicipalServicesSection/MunicipalServicesSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

export const getServerSideProps = amplifyGetServerSideProps(async () => {
  return {
    props: {
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountMunicipalServicesPage = () => {
  return (
    <AccountPageLayout>
      <MunicipalServicesSection />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountMunicipalServicesPage)

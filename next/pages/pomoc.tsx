import { strapiClient } from '@clients/graphql-strapi'
import { HelpPageFragment } from '@clients/graphql-strapi/api'
import HelpSection from 'components/forms/segments/AccountSections/HelpSection/HelpSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type AccountHelpPageProps = {
  helpPage: HelpPageFragment
}

export const getServerSideProps = amplifyGetServerSideProps<AccountHelpPageProps>(async () => {
  const helpPageQuery = await strapiClient.HelpPage()
  const helpPage = helpPageQuery?.helpPage?.data?.attributes

  if (!helpPage) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      helpPage,
      ...(await slovakServerSideTranslations()),
    },
  }
})

const AccountHelpPage = ({ helpPage }: AccountHelpPageProps) => {
  return (
    <AccountPageLayout>
      <HelpSection helpPage={helpPage} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountHelpPage)

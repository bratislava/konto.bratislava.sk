import { client } from '@clients/graphql-strapi'
import { HelpPageFragment } from '@clients/graphql-strapi/api'
import HelpSection from 'components/forms/segments/AccountSections/HelpSection/HelpSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'

import { SsrAuthProviderHOC } from '../components/logic/SsrAuthContext'
import { amplifyGetServerSideProps } from '../frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '../frontend/utils/slovakServerSideTranslations'

type HelpPageProps = {
  helpPage: HelpPageFragment
}

export const getServerSideProps = amplifyGetServerSideProps<HelpPageProps>(async () => {
  const helpPageQuery = await client.HelpPage()
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

const AccountHelpPage = ({ helpPage }: HelpPageProps) => {
  return (
    <AccountPageLayout>
      <HelpSection helpPage={helpPage} />
    </AccountPageLayout>
  )
}

export default SsrAuthProviderHOC(AccountHelpPage)

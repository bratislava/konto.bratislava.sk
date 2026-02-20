import { strapiClient } from '@/src/clients/graphql-strapi'
import { HelpPageFragment } from '@/src/clients/graphql-strapi/api'
import PageLayout from '@/src/components/layouts/PageLayout'
import { SsrAuthProviderHOC } from '@/src/components/logic/SsrAuthContext'
import HelpPageContent from '@/src/components/page-contents/HelpPageContent/HelpPageContent'
import { amplifyGetServerSideProps } from '@/src/frontend/utils/amplifyServer'
import { slovakServerSideTranslations } from '@/src/frontend/utils/slovakServerSideTranslations'

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
    <PageLayout>
      <HelpPageContent helpPage={helpPage} />
    </PageLayout>
  )
}

export default SsrAuthProviderHOC(AccountHelpPage)

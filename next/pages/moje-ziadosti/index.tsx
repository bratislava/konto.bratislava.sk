import MyApplicationsSection, {
  getTotalNumberOfApplications,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      totalCounts: {
        SENT: await getTotalNumberOfApplications('SENT', ctx.req),
        SENDING: await getTotalNumberOfApplications('SENDING', ctx.req),
        DRAFT: await getTotalNumberOfApplications('DRAFT', ctx.req),
      },
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountMyApplicationsPage = ({
  totalCounts,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <AccountPageLayout>
      <MyApplicationsSection totalCounts={totalCounts} />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)

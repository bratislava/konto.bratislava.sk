import MyApplicationsSection, {
  getTotalNumberOfApplications,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { ROUTES } from 'frontend/api/constants'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'
  const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)
  if (!ssrCurrentAuthProps.userData) {
    return {
      redirect: {
        destination: `${ROUTES.LOGIN}?from=${ctx.resolvedUrl}`,
        permanent: false,
      },
    }
  }

  return {
    props: {
      ssrCurrentAuthProps,
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

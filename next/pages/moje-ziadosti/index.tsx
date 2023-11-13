import MyApplicationsSection, {
  getTotalNumberOfApplications,
} from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { environment } from '../../environment'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (!environment.featureToggles.forms) return { notFound: true }
  const locale = ctx.locale ?? 'sk'

  return {
    props: {
      ssrCurrentAuthProps: await getSSRCurrentAuth(ctx.req),
      page: {
        locale: ctx.locale,
        localizations: ['sk', 'en']
          .filter((l) => l !== ctx.locale)
          .map((l) => ({
            slug: '',
            locale: l,
          })),
      },
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
  page,
  totalCounts,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout>
        <MyApplicationsSection totalCounts={totalCounts} />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)

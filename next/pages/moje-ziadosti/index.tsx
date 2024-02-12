import { getDraftApplications } from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsList'
import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { ROUTES } from 'frontend/api/constants'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const sections = ['SENT', 'SENDING', 'DRAFT'] as const

export type ApplicationsListVariant = (typeof sections)[number]

const slovakToEnglishSectionNames: Record<string, ApplicationsListVariant> = {
  odoslane: 'SENT',
  'odosiela-sa': 'SENDING',
  koncepty: 'DRAFT',
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const locale = ctx.locale ?? 'sk'
  const selectedSection = ctx.query.sekcia
    ? slovakToEnglishSectionNames[ctx.query.sekcia as ApplicationsListVariant]
    : 'SENT'
  const currentPage = parseInt(ctx.query.strana as string, 10) || 1
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
      applications: await getDraftApplications(selectedSection, currentPage, ctx.req),
      selectedSection,
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountMyApplicationsPage = ({
  selectedSection,
  applications,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <AccountPageLayout>
      <MyApplicationsSection selectedSection={selectedSection} applications={applications} />
    </AccountPageLayout>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)

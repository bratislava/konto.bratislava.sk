import MyApplicationsSection from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationsSection'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { getApplicationConceptList, getApplicationSentList } from 'frontend/api/mocks/mocks'
import { isProductionDeployment } from 'frontend/utils/general'
import logger from 'frontend/utils/logger'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (isProductionDeployment()) return { notFound: true }
  const locale = ctx.locale ?? 'sk'

  let myApplicationSentList
  let myApplicationConceptList
  try {
    myApplicationSentList = getApplicationSentList()
    myApplicationConceptList = getApplicationConceptList()
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  return {
    props: {
      myApplicationSentList,
      myApplicationConceptList,
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
      isProductionDeploy: isProductionDeployment(),
      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountMyApplicationsPage = ({
  page,
  myApplicationSentList,
  myApplicationConceptList,
  isProductionDeploy,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout isProductionDeploy={isProductionDeploy}>
        <MyApplicationsSection
          conceptCardsList={myApplicationConceptList}
          sentCardsList={myApplicationSentList}
          isProductionDeploy={isProductionDeploy}
        />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)

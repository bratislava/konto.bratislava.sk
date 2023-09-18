import { formsApi } from '@clients/forms'
import { GetFormResponseDto } from '@clients/openapi-forms'
import MyApplicationDetails from 'components/forms/segments/AccountSections/MyApplicationsSection/MyApplicationDetails'
import AccountPageLayout from 'components/layouts/AccountPageLayout'
import PageWrapper from 'components/layouts/PageWrapper'
import {
  getSSRCurrentAuth,
  ServerSideAuthProviderHOC,
} from 'components/logic/ServerSideAuthProvider'
import { MyApplicationHistoryDataBase } from 'frontend/api/mocks/mocks'
import logger from 'frontend/utils/logger'
import { AsyncServerProps } from 'frontend/utils/types'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { environment } from '../../environment'

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  if (!environment.featureToggles.forms) return { notFound: true }
  const locale = ctx.locale ?? 'sk'
  const id = ctx.query.ziadost as string

  // const ssrCurrentAuthProps = await getSSRCurrentAuth(ctx.req)

  if (!id) return { notFound: true }

  let myApplicationDetailsData: GetFormResponseDto | null = null
  let myApplicationHistoryData: MyApplicationHistoryDataBase[] | null = null
  try {
    const response = await formsApi.nasesControllerGetForm(id, {
      accessToken: 'always',
      accessTokenSsrReq: ctx.req,
    })
    myApplicationDetailsData = response?.data // getApplicationDetailsData(ctx.query.ziadost) || null
    // TODO
    myApplicationHistoryData = null
  } catch (error) {
    logger.error(error)
    return { notFound: true }
  }

  if (!myApplicationDetailsData) return { notFound: true }

  return {
    props: {
      myApplicationDetailsData,
      myApplicationHistoryData,
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

      ...(await serverSideTranslations(locale)),
    },
  }
}

const AccountMyApplicationsPage = ({
  page,
  myApplicationDetailsData,
  myApplicationHistoryData,
}: AsyncServerProps<typeof getServerSideProps>) => {
  return (
    <PageWrapper locale={page.locale} localizations={page.localizations}>
      <AccountPageLayout>
        <MyApplicationDetails
          historyData={myApplicationHistoryData}
          detailsData={myApplicationDetailsData}
        />
      </AccountPageLayout>
    </PageWrapper>
  )
}

export default ServerSideAuthProviderHOC(AccountMyApplicationsPage)
